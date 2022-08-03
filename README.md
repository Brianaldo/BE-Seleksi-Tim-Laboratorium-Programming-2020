# BE-Seleksi-Tim-Laboratorium-Programming-2020

### Requirements
[![Made with Node.js](https://img.shields.io/badge/Node.js->=12-blue?logo=node.js&logoColor=white)](https://nodejs.org "Go to Node.js homepage")
[![Made with MySQL](https://img.shields.io/badge/MySQL->=5.7-blue?logo=mysql&logoColor=white)](https://www.mysql.com/ "Go to MySQL homepage")
redis
TypeORM
Typescript
ExpressJS

### Design Pattern
1. Singleton <br />
   Pada inisialisasi app, agar menghindari pembuatan object app baru yang berpotensi dapat merusak program.
2. State  <br />
   Design pattern state digunakan pada state dari suatu transaksi (deposit dan withdraw). Pada transaksi terdapat state pending, accepted dan rejected.
3. Proxy  <br />
   Design pattern proxy digunakan saat melakukan pengambilan data currency. Hal ini dilakukan untuk meminimalkan pemanggilan API sehingga fetching akan dilakukan pada redis terlebih dahulu.
4. Factory  <br />
   Pada pembuatan entity untuk ORM, digunakan pattern factory sehingga setiap object dibuat dengan factory yang sama yaitu @Entity.

### How to run
1. Clone repositori ini
    ```
    git clone https://github.com/Brianaldo/BE-Seleksi-Tim-Laboratorium-Programming-2020.git
    ```
2. Masuk direktori
    ```
    cd BE-Seleksi-Tim-Laboratorium-Programming-2020
    ```
3. Install dependensi
    ```
    yarn
    ```
4. Setup .env
5. Run
    ```
    yarn dev
    ```
    
### API Endpoint

| Endpoint                         | Method    | Access          |
|----------------------------------|-----------|-----------------|
| /register                        | POST      | All             |
| /admin/register                  | POST      | All             |
| /login                           | POST      | All             |
| /admin/verify                    | GET       | Admin           |
| /admin/verify                    | PUT       | Admin           |
| /transaction                     | POST      | Customer        |
| /admin/transaction               | GET       | Admin           |
| /admin/transaction               | PUT       | Admin           |
| /transfer                        | POST      | Customer        |
| /history/{page}                  | GET       | Customer        |
| /profile                         | GET       | Customer        |
| /admin/profile                   | POST      | Admin           |
| /admin/profile/{username}        | GET       | Admin           |
| /admin/profile/{username}/{page} | GET       | Admin           |
| /currency                        | GET       | All             |
