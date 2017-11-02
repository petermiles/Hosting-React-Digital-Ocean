## Deploying a Single Page React App On Digital Ocean

### Make sure your server is setup to run off the build process

Before we want to deploy our project, we should make sure that our project is working on our local machine.  If it's not working, open you dev console, look at your terminal output.  And try to figure out what is causing it to break locally.

Up till now we have been using the React Dev Server to serve our react app.  We are going to update this so that it will use a production build of our project.  This will do things such as removing extra white-space, comments, and minify our code so that it's as fast to download as possible.  

Tell create-react-app to use webpack to create a build folder with your latest code.

`npm run build`

Make sure your dev server isn't running for the front end.  Start your backend server

`nodemon`

In your browser, check that you can go to http://localhost:3030 (or whichever port you told your backend to run on.) And make sure that you are sending the files to the front end.


Make sure your express.static is pointing to the build folder.

```
app.use( express.static( `${__dirname}/../build` ) );
```

If you are using browser history, you'll need this to make sure your index.html file is being given on the other routes.

Towards the *end* of your server file make sure you have this (this needs to run after you've setup all your other endpoints)

```
const path = require('path')
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, '../build/index.html'));
})
```
Check that your project is working.

If it is not.  Check your DevTools console, as well as the server terminal output to figure out what is going wrong.  

## Ensure you've setup a .env file, and set node to use it for your project.

All the configuration that you need different between deployed and local should go into this file.  As well as any keys that you want to be secret.  

The connection string to your database, the REACT_APP_ reference for Auth0, as well as your Auth0 credentials should be in here.  You may have additional variables set here if you want to make other changes between a local and production build.  

*Make sure the .gitignore contains the .env and files*

Example .env file

```
REACT_APP_LOGIN="http://localhost:3030/api/auth/login"
REACT_APP_LOGOUT="http://localhost:3030/api/auth/logout"

DOMAIN="brack.auth0.com"
ID="46NxlCzM0XDE7T2upOn2jlgvoS"
SECRET="0xbTbFK2y3DIMp2TdOgK1MKQ2vH2WRg2rv6jVrMhSX0T39e5_Kd4lmsFz"
SUCCESS_REDIRECT="http://localhost:3030/"
FAILURE_REDIRECT="http://localhost:3030/api/auth/login"

CONNECTION_STRING="postgres://vuigx:k8Io23cePdUorndJAB2ijk_u0r4@stampy.db.elephantsql.com:5432/vuigx"
NODE_ENV=development
```

Then we are going to check out main server file.
It should contain the following at the beginning of your code (It can go anywhere before you first try to use the process.env variables, but the first line makes sure that it is always available to you);

`require('dotenv').config();`

If you did not have this already in your project, you will need to install dotenv.

`npm i dotenv`

Double check that your server is still working with this new configuration setting.



# Setup with Digital Ocean


## Hosting your node projects on Digital Ocean.

  This tutorial is for setting up small personal sites on Digital Ocean, it does not cover the myriad of topics that will be important to long term system management.  But if you're wanting to host personal projects, or portfolio pieces it will help get you started.

## Turn off React's default Web Service Worker

  Create React App's built in web service worker creates some problems when you try to server you API and your local files at the same time.  If you haven't already, remove the default web service worker from your  
  From your src/index.js file.  Delete or comment out the line that says `registerServiceWorker();`

### Register for Digital Ocean

  If you've not already created a Digital Ocean Account, you can sign up through [this](https://m.do.co/c/8ea79fee4894) link to get $10 free.

### Create SSH Keys

To connect to our server we will use SSH keys.  It will make working with your server much easier.

  ```ssh-keygen -t rsa```

This will start a process to step you through the key generation process.  The default location and filename are best for your first key.

Take note that after asking for the file, it will ask for a passphrase.  There is no way to recover this passphrase.  So make it something that you will remember.  

  ```sh
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/username/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in demo_rsa.
Your public key has been saved in demo_rsa.pub.
The key fingerprint is:
cc:28:30:44:01:41:98:cf:ae:b6:65:2a:f2:32:57:b5 user@user.local
The key's randomart image is:
+--[ RSA 2048]----+
|=*+.             |
|o.               |
| oo              |
|  oo  .+         |
| .  ....S        |
|  . ..E          |
| . +             |
|*.=              |
|+Bo              |
+-----------------+
```

This will create two files on your computer.  ```id_rsa``` and ```id_rsa.pub``` if you used the default. They will be in your ```~/.ssh``` folder.
The one with .pub is your public key, this is what you can give to services like Digital Ocean and Github to identify your computer.  

Go ahead and cat your public key.

```cat ~/.ssh/id_rsa.pub```

It looks like a long string of goblity goop. It is the contents of the whole file.  Starting with the ```ssh-rsa``` and all the way to the ```User@Computer.local``` at the end.  (On windows machine git bash has a habit of including the spaces from the word wrap in the copied string.  For windows users may want to open file with notepad or other editor before copy.)

```sh
ssh-rsaAABC3NzaC1yc2EAAAADAQABAAABAQDR5ehyadT9unUcxftJOitl5yOXgSi2Wj/s6ZBudUS5Cex56LrndfP5Uxb8+Qpx1D7gYNFacTIcrNDFjdmsjdDEIcz0WTV+mvMRU1G9kKQC01YeMDlwYCopuENaas5+cZ7DP/qiqqTt5QDuxFgJRTNEDGEebjyr9wYk+mveV/acBjgaUCI4sahij98BAGQPvNS1xvZcLlhYssJSZrSoRyWOHZ/hXkLtq9CvTaqkpaIeqvvmNxQNtzKu7ZwaYWLydEKCKTAe4ndObEfXexQHOOKwwDSyesjaNc6modkZZC+anGLlfwml4IUwGv10nogVg9DTNQQLSPVmnEN3Z User@Computer.local
```
Copy the whole thing either from the output, opening the file and copying it, or with the command below.  

```pbcopy < ~/.ssh/id_rsa.pub```

### Adding your SSH Key to Digital Ocean

You'll need to go to your [Securit Settings.](https://cloud.digitalocean.com/settings/security)

Click on Add SSH key, paste your **public** SSH key into the box.  You can give the key a name to remember which key it is.  I usually recommend a combination of your name, and which computer the key is on.  So something like Brack Macbook.  

### Create Droplet

Now we can spin up a [droplet.](https://cloud.digitalocean.com/droplets)  Click Create Droplet.  Here we can choose what OS we want our server to be, as well as choose some default software to install.  

Unless you have a reason not to, I suggest Ubuntu for the operation system.  None of the images come with postgres installed, so we can just go with the blank build.

Select your droplet size $5.  Select a data center, probably San Francisco or New York. You can select additional services, though some of these cost extra.  Make sure to select the SSH key you registered earlier. Name your droplet, it doesn't really matter what you call it, but you can put multiple projects on a single droplet, so you may not want it to be named after any specific project.

### Connect to your Server

After your droplet has spun up, you'll know your ip address.  We'll connect to the droplet through the ssh (Secure SHell) command

```ssh root@222.222.222.222```

root is the user that you will connect as.  You  an optionally set up [different users](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04) with their own ssh keys in case you want others to share the server, or connecting to a system as the root user all the time makes you queasy.   

### Install Node

Initially an older version of Node is installed on the server, let's go ahead and update it real quick.  

`apt-get update && apt-get dist-upgrade`  This updates the linux list of software it knows about

`apt-get install nodejs` This will install nodejs (v4 of node)

`apt-get install npm` This will install npm (the unix version doesn't bundle npm with the default node install)

`npm i -g n` This installs a program called n that we can use to update node

`n latest ` Install the latest version of node (We can also install a specific version by n 7.5.1)

`npm i -g npm` Install the latest version of npm


## Swap
Swap instructions from [Zac Anger's](https://github.com/zacanger) wonderful [documentation](https://github.com/zacanger/doc).

The most limited resource on your droplet will be RAM. They don't come with much on the $5 tier.
You don't need a whole lot to run your server, but npm and webpack take their fair share. You could pay for more RAM, but you could also just set up a swapfile.



```
touch /swapfile
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

* The swapfile will only be in use till the droplet restarts.
* You can turn off the swapfile by using ```swapoff /swapfile``` After you run your grunt gulp or webpack commands
* If you want to make it so the dorplet loads with the swapfile one
* `nano /etc/fstab`. add the following to the bottom:
  `/swapfile   none    swap    sw    0   0`
* We can also tell the server to use the swap file less frequently by lowering the swapiness
* We should adjust swappiness closer to 0 (from the default 60). `nano /etc/sysctl.conf`
  and add `vm.swappiness=10` to the bottom.

--------

### Clone Project

Now we can get your project cloned to your repo. Make sure you're at your home directory  
```
cd ~
```
Then we can clone the project from Github.  (You'll need to use the https version of the link, unless you create an ssh key on your server to use.)

cd into your project, npm install, and any preprocessing (gulp, grunt, webpack) that you need to do. Also create and setup any config / .env files that are in your .gitignore.    

```
git clone https://link-to-my-repo.com/github/projet.git
cd my-project-folder-name
npm install
```

`touch .env`
`nano .env`

If your project is React with create-react-app run `npm run build` to create the build folder with your code changes.  If this process fails, double check that all your installed dependencies are in your package.json, and you've provided any configuration files you need to have

If you wave a different build process, run that (such as grunt gulp or webpack if you were doing another framework, or custom build process for react)

Now run node to check for any server load errors (in case you forgot to --save all your dependencies.)

```
node server/server.js
```

If you get any errors, npm install those packages, and repeat till the server runs.  

You should now be able to go to ipaddrress:port in your browser to see your project.
```126.152.73.125:8082```

If your server is running on port 80, you can drop specifying the port number.  

### Install forever

Terminate your node server if it's still running.   We're going to install a forever, a program that will keep your server running after you log out of the server, and will auto restart the server if it crashes.  (unless it's crashing too quickly.)  

We can also set up the forever list to show the folder the script was ran from.  Useful if you have several projects running on one droplet.

Then we will start the process running.

```sh
npm install -g forever
forever start server/server.js
```

When you have changes that you want to bring into the project.  Make sure that you've pushed to to github.  Then from your server.  The exact process you do may change a bit depending on how you've set up your project.

```git pull``` This will get the new code onto the server.

```npm build``` (react changes) In case you have a build process that needs to recompile those changes on the server

```forever restartall``` (server changes) Restart the server to bring in the new server changes

### Useful Forever Commands

To see the currently running processes: ```forever list```

To restart all forever processes: ```forever restartall```

To restart a specific process: ```forever restart X``` where X is a pid, uid, or process index.

To Stop all forever processes:```forever stopall```

If you want to format the forever list output. I recommend the following changes to add the directory the script was ran from, and removing the command, as it should be node that is running the process.

```
forever columns rm command
forever columns add dir
```

### Postgres and you

For your projects you have a few options.  You can install Postgres on your server.  Then your project will look at the local machine for it's database the same way that it does when running on your local machine.  The downside to this is if you like working with tools like pgAdmin, it can be difficult to get configured correctly.

Or you can go with a DB as a service such as [ElephantSQL](https://www.elephantsql.com/). ElephantSQL has a free tier with 20MB disk space.  Not a ton, but for small project not needing to worry about it's set up may be worth it.

### Setting Up Domains

Unless you have lots of friends that enjoy accessing websites by ip (You know they exist) You'll want to route your domain to point at your server.  This is slightly different for each register.  Or you can tell the reigstrar to let Digital Ocean manage your routes.  [Here](https://github.com/zacanger/doc/blob/master/digital-ocean.md#domains) is a short description of how to set up Domain records.  

### NGINX - Optional

If you don't want to use port 80, or you want to put multiple projects on one droplet, we can do that with nginx.

nginx will work like middleware for all the traffic coming to your droplet.  We can use it to watch for specific domain names, or url parameters, then route it to different parts of our droplet based on those factors.

```
sudo apt-get install nginx;
```

Next we are going to go to this folder.
```
cd /etc/nginx/sites-available/
```
*if this folder does not exist instead go to the `cd /etc/nginx/conf.d` folder*

We can set up each individual servers by editing the default file in this folder.  `nano default`

*if there wasn't a sites-avaiable folder you will use `nano default.conf` instead*  

This example sets up 3 different servers listening for different domains/subdomains.

They should all listen to port 80, that's the default for web-traffic. The server_name should be changed for each server, this is the domain that you want associated with each server.  Also the proxy_pass needs to be changed to match the port each is running on.
```
# Basic server block setup

server {
    listen 80;

    server_name eloeverything.com;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Basic server + www subdomain on a single setup
server {
    listen 80;

    server_name brackcarmony.com www.brackcarmony.com;

    location / {
        proxy_pass http://127.0.0.1:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Custom Subdomain Setup
server {
    listen 80;

    server_name data.brackcarmony.com;

    location / {
        proxy_pass http://127.0.0.1:8084;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Route based on the url provided after the domain
# This will route traffice that starts with brackcarmony.com/projects/ to port 8084
# putting the / at the end of the proxy_pass will make it so that your server code will
# ignore the /projects/ part of the url. So that you can write your backend server as if it
# were being accessed from just /
server {
    listen 80;

    server_name brackcarmony.com;

    location /projects/ {
        proxy_pass http://127.0.0.1:8085/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

After saving and exiting the file.  Run ```sudo service nginx restart```

### SSH config files - Optional

If you want to have an easier way to connect to servers that you use freqently, you can make a config file.
On your computer in the ```~/.ssh``` folder ```touch config``` (no extension)  open it in your editor of choice
We are going to name all the servers we want to keep track of, along with the credentials they use.  

```
Host <nickname> // This will be our nickname for the server
    HostName <myServer.com> // Either the IP adress or domain name that you want to connect to
    Port 22 // This is 22 by default for SSH connections
    RemoteForward 52698 localhost:52698 // This is if you want to use the rmate or ratom packages
    User username // either root or one of the users you created on the server to run things
    IdentityFile ~/.ssh/id_rsa // Path to private key used for this connection in case you have multiple

Host q
    HostName q.devmountain.com
    Port 22
    RemoteForward 52698 localhost:52698
    User devmtn
    IdentityFile ~/.ssh/id_rsa

Host brack
    HostName brackcarmoy.com
    Port 22
    RemoteForward 52698 localhost:52698
    User root
```

After creating this you can just run ```ssh brack``` in place of ```ssh root@brackcarmony.com```
