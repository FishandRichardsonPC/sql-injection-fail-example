# sql-injection-fail-example

This is an example of sql injection which should be detected by SAST tools.
A developer who knows how to build an apollo server should be able to quickly
identify the issue here but this sort of thing should be caught. In order to prove
the injection possibility. I have also patched the @fish-and-richardson-pc/apollo-datasource-msnodesqlv8
package to log the sql just before executing it so you can prove the injection without connecting
to a real database. To repro the injection do the following:

1. [Install Corepack](https://yarnpkg.com/getting-started/install#install-corepack)
2. Run `yarn`
3. Run `yarn start`
4. Visit http://localhost:4000/
5. Click "Query your server"
6. Enter the following in the Operations editor
    ```graphql
    query Books($parameter: String) {
        books(parameter: $parameter) {
            title
            author
        }
    }
    ```
7. Enter the following in the Variables editor
    ```json
    {
        "parameter": "''; DROP TABLE Things"
    }
    ```
8. Click `▶ Books`
9. Look in the console. You should see:
   ```sql
   SELECT Stuff
   FROM Things
   WHERE OtherStuff = ''; DROP TABLE Things
   ```
   Illustrating a successful sql injection
