source ~/.bash_profile
forever stop app.js
NODE_ENV=test forever start -a -l ./firever.log -o out.log -e err.log app.js