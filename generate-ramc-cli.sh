#!/bin/bash

PRJ_DIR_NAME='ramc-cli'

BUILD_TYPE='release'
ANDROID_TARGET_API='android-17'

usage()
{
  echo -e "RAMC Client Android application generation script."
  echo -e "Params:"
  echo -e "-n \t folder name for generated .apk files"
  echo -e "-l \t path to logo image"
  echo -e "-f \t text to show on 'Case' is fails to send"
  echo -e "-i \t text to show in 'Information' screen"
  echo -e "-p \t 'Support center' phone"
  echo -e "-r \t Program name"
}

while getopts n:l:f:i:p:r: option
do
  case "$option" in
    "n") NAME=$OPTARG;;
    "l") LOGO=$OPTARG;;
    "f") FAIL_TEXT=$OPTARG;;
    "i") INFO_TEXT=$OPTARG;;
    "p") PHONE=$OPTARG;;
    "r") PROGRAM=$OPTARG;;
    "?") usage
       exit 2;;
  esac
done

if [ ! -f "$LOGO" ]
then
  echo "Error: File $LOGO don't exist."
  exit 2
fi

if [ -z "$NAME" ] ||
  [ -z "$FAIL_TEXT" ] ||
  [ -z "$INFO_TEXT" ] ||
  [ -z "$PHONE" ] ||
  [ -z "$PROGRAM" ]
then
  echo "Error: Please, enter all parameters."
  usage
  exit 2
fi

# clone application
WORK_DIR=$PWD
SRC_PRJ_DIR=$PWD/$PRJ_DIR_NAME
GEN_PRJ_DIR=$PWD/gen-cli/$NAME

mkdir -p $GEN_PRJ_DIR
cp -R $SRC_PRJ_DIR $GEN_PRJ_DIR
# end cloning

cd $GEN_PRJ_DIR/$PRJ_DIR_NAME

# set values from user defined params

# .. set logo
RAMC_LOGO=$PWD/res/drawable/ramc_logo.png
cp $LOGO $RAMC_LOGO

# .. set string constants
STRINGS_XML_FILE=$PWD/res/values/strings.xml
STRINGS_XML_TMP_FILE=$PWD/res/values/strings.xml.tmp

cat $STRINGS_XML_FILE | \
awk -v p="$PHONE" \
'/<string name=\"support_phone\">/{gsub(/>.*</,">"p"<");}1' | \
awk -v i="$INFO_TEXT" \
'/<string name=\"info_text\">/{gsub(/>.*</,">"i"<");}1' | \
awk -v f="$FAIL_TEXT" \
'/<string name=\"case_send_fail_message\">/{gsub(/>.*</,">"f"<");}1' | \
awk -v r="$PROGRAM" \
'/<string name=\"program\">/{gsub(/>.*</,">"r"<");}1' \
> $STRINGS_XML_TMP_FILE

mv $STRINGS_XML_TMP_FILE $STRINGS_XML_FILE
# end setting values

# start build app
android -s update project --path . --target $ANDROID_TARGET_API
ant -q $BUILD_TYPE
# end building

# save generated *.apk files
# and clean up
cp ./bin/*.apk $GEN_PRJ_DIR
rm -rf $GEN_PRJ_DIR/$PRJ_DIR_NAME
# end clean up

cd $WORK_DIR
