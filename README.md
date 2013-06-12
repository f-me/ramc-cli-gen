#### Описание
Shell скрипт, который собирает билд, для Android приложения `ramc-cli`.

#### Использование
Запустить скрипт из командной строки, указав в параметрах требуемые значения,
для генерирования кастомного билда:
`$ ./generate-ramc-cli.sh -n <NAME> -l <PATH_TO_LOGO_IMAGE> -f <FAIL_MESSAGE> \
-i <INFO_MESSAGE> -p <SUPPORT_PHONE>`

где:

- <NAME> имя билда
- <PATH_TO_LOGO_IMAGE> путь к картинке с логотипом
- <FAIL_MESSAGE> сообщение показывающееся пользователю при невозможности
  отправки заявки на сервер
- <INFO_MESSAGE> информационное сообщение отображаемое на экране "Информация"
- <SUPPORT_PHONE> телефон службы поддержки клиентов

порядок следования параметров не важен,
важно их общее присутствие.

Сгенерированые билды будут находиться в папке `gen/<NAME>`.

Исходный код Android приложения должен находиться в папке `ramc-cli`.
