var port = 3001;

const express = require('express');
const hbs = require('express-handlebars');
let app = express();

app.engine('hbs',hbs({
                extname: 'hbs',
                //defaultLayout: 'main',
                partialsDir: __dirname+'/views/common'
            }));
app.set('view engine','hbs');

app.use('/',express.static(__dirname+'/public'));

app.get('/',(req,res) => {
    res.render('register');
});

app.get('/login.html',(req,res) => {
    res.render('login');
});

app.get('/add-project.html',(req,res) => {
    res.render('add_project');
});

app.get('/manage-projects.html',(req,res) => {
    res.render('manage-projects');
});

app.get('/project-detail.html',(req,res) => {
    res.render('project-details');
});

app.listen(port,() => {
    console.log(`Goto broswer using ${port}`);
});