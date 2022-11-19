![Deploy](https://github.com/Jaspero/cron-server/workflows/Deploy/badge.svg)

# Cron Server

The Cron Server is CRON management server with a Restful API. It consists of 4 modules Users, Accounts, Jobs and Responses.

[Rest API Documentation](https://documenter.getpostman.com/view/3034144/TVK5dhBn)

## Users

Users are administrators with access to the UI. There isn't any roles system so each user has permission to perform
any actions in the platform including adding and removing other users.

## Accounts

An account is an application using the API. It's a name and API Key pair that authenticates with the app using basic authentication.

## Jobs

Jobs are the core of the application. A job is a CRON along with information for the request that should be sent in each invocation.

## Responses

Each invocation of a job creates a response, this contains the status and time as well as optionally the returned request
body and headers.

## Deployment 

1. Set up a virtual machine in google cloud (any VM would work but the workflow deployment is intended for google cloud specifically). Even an `e2-micro` machine should be sufficient initially.
2. You'll need to install the following dependencies
   - Node v14+
     ```
     sudo apt-get update
     sudo apt-get install nodejs
     sudo apt-get install npm
     sudo npm install -g n
     sudo n stable
     ```
   - [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-debian/)
     ```
     sudo apt-get install wget
     wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
     echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
     sudo apt-get update
     sudo apt-get install -y mongodb-org
     sudo systemctl start mongod
     sudo systemctl enable mongod
     ```
   - [PM2](https://pm2.keymetrics.io/)
     ```
     sudo npm i -g pm2
     ```
3. Generate an SSH key to access the VM.
   - `ssh-keygen -t ed25519 -a 200 -C "info@jaspero.co"`
   - Add the public key to the VM (under edit in google cloud)
   - Add the private key to github secrets under `VM_KEY`
   - Add the email to github secrets under `VM_USER`
   - Add the VMs public IP to github secrets under `VM_HOST`
4. Configure mongo secrets:
   - `USER_EMAIL` - this is the email for the admin user
   - `USER_PASSWORD` - this is the password for the admin user
   - `DB_HOST` - `mongodb://127.0.0.1:27017`
5. Add a `SECRET` value to github 
6. Set up NGNIX for the api (optional). Full guide [here](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-11).
   - `sudo apt install nginx`
   - `sudo nano /etc/nginx/sites-available/cron.jaspero.co`
   - ```
     server {
          listen 80;
          server_name cron.jaspero.co;
          location / {
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header Host $host;
              proxy_pass http://127.0.0.1:2000;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
          }
      }
      ```
    - `sudo ln -s /etc/nginx/sites-available/cron.jaspero.co /etc/nginx/sites-enabled/`  
    - `sudo systemctl restart nginx`
7. Install Certbot and HTTPS (optional). Full guide [here]().
   ```
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d cron.jaspero.co
   ```
