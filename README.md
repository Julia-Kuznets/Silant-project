# Электронная сервисная книжка "Мой Силант"

Дипломный проект. Веб-сервис для учета и сопровождения погрузочной техники компании "Силант".

##  Технологический стек

*   **Backend:** Python 3.10, Django, Django REST Framework
*   **Frontend:** React, JavaScript, React-Bootstrap, Axios
*   **Database:** PostgreSQL 15
*   **Infrastructure:** Docker, Docker Compose, Nginx, Gunicorn

##  Функциональность

*   **Ролевая модель:**
    *   *Гость:* Поиск машины по заводскому номеру (ограниченный просмотр).
    *   *Клиент:* Просмотр списка своей техники и детальной информации.
    *   *Сервисная организация:* Просмотр своих машин, внесение данных о ТО и Рекламациях.
    *   *Менеджер:* Полный доступ к базе и справочникам.
*   **Интерфейс:**
    *   Адаптивная верстка (Mobile/Desktop).
    *   Сортировка таблиц по заголовкам.
    *   Фильтрация по моделям и узлам.
*   **API:**
    *   RESTful API.
    *   Swagger-документация (`/swagger/`).

##  Как запустить проект (Docker)

Проект полностью докеризирован. Для запуска требуется только установленный Docker Desktop.

1.  **Клонируйте репозиторий:**
    ```bash
    git clone <https://github.com/Julia-Kuznets/Silant-project.git>
    cd silantproject
    ```

2.  **Создайте файл `.env`** в корне проекта со следующим содержимым:
    ```env
    DEBUG=1
    SECRET_KEY=dev_secret_key_123
    POSTGRES_DB=silant_db
    POSTGRES_USER=silant_user
    POSTGRES_PASSWORD=silant_pass
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    ```

3.  **Запустите сборку и контейнеры:**
    ```bash
    docker-compose up -d --build
    ```
    *Первый запуск может занять несколько минут.*

4.  **Создайте суперпользователя (Администратора):**
    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```

5.  **Готово!**
    *   Сайт доступен по адресу: [http://localhost](http://localhost)
    *   Админ-панель: [http://localhost/admin/](http://localhost/admin/)
    *   Swagger API: [http://localhost/swagger/](http://localhost/swagger/)

##  Тестирование

Для запуска автоматических тестов бэкенда выполните:
```bash
docker-compose exec backend python manage.py test