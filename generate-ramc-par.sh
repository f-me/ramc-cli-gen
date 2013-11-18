#!/bin/bash

PRJ_DIR_NAME='ramc-par'
GOOGLE_PLAY_LIB_DIR_NAME='google-play-services_lib'

BUILD_TYPE='release'
ANDROID_TARGET_API='android-17'

usage()
{
  echo -e "RAMC Partner Android application generation script."
  echo -e "Params:"
  echo -e "-n \t folder name for generated .apk files"
  echo -e "-p \t partner identification number"
}

while getopts n:p: option
do
  case "$option" in
    "n") NAME=$OPTARG;;
    "p") PARTNER_ID=$OPTARG;;
    "?") usage
       exit 2;;
  esac
done

if [ -z "$NAME" ] ||
  [ -z "$PARTNER_ID" ]
then
  echo "Error: Please, enter all parameters."
  usage
  exit 2
fi

# clone application
WORK_DIR=$PWD
SRC_PRJ_DIR=$PWD/$PRJ_DIR_NAME
GEN_PRJ_DIR=$PWD/gen-par/$NAME

mkdir -p $GEN_PRJ_DIR
cp -R $SRC_PRJ_DIR $GEN_PRJ_DIR

# ..clone required libs
SRC_GOOGLE_PLAY_LIB_DIR=$PWD/$GOOGLE_PLAY_LIB_DIR_NAME
cp -R $SRC_GOOGLE_PLAY_LIB_DIR $GEN_PRJ_DIR
# end cloning

cd $GEN_PRJ_DIR/$PRJ_DIR_NAME

# set values from user defined params

# .. set string constants
STRINGS_XML_FILE=$PWD/res/values/strings.xml
STRINGS_XML_TMP_FILE=$PWD/res/values/strings.xml.tmp

cat $STRINGS_XML_FILE | \
awk -v p="$PARTNER_ID" \
'/<string name=\"partner_id\">/{gsub(/>.*</,">"p"<");}1' \
> $STRINGS_XML_TMP_FILE

mv $STRINGS_XML_TMP_FILE $STRINGS_XML_FILE
# end setting values

# start build app
android -s update lib-project \
--target $ANDROID_TARGET_API \
--path ../google-play-services_lib

android -s update project \
--path . \
--target $ANDROID_TARGET_API \
--library ../google-play-services_lib

ant -q $BUILD_TYPE
# end building

# save generated *.apk files
# and clean up
cp ./bin/*.apk $GEN_PRJ_DIR
rm -rf $GEN_PRJ_DIR/$PRJ_DIR_NAME
rm -rf $GEN_PRJ_DIR/$GOOGLE_PLAY_LIB_DIR_NAME
# end clean up

cd $WORK_DIR
