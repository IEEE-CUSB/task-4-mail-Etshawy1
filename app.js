var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static('public'));
var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({ extended: false });


//to enable sending an email
var nodeMailer = require('nodemailer');


//configuring the mysql link
/*
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Workshops'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});
*/

//spreadsheet part
var GoogleSpreadsheet = require('google-spreadsheet');
var {promisify} = require('util');
var credentials = require('./google-sheet/client-secret.json');


//function to establish connection with a specific sheet and insert the data into
async function accessSpreadSheet(req){
  const doc = new GoogleSpreadsheet('1zP_QNL7DupJtapb686mUgY_iBfx28ly7O5X20cY_lYo');
  await promisify(doc.useServiceAccountAuth)(credentials);
  const info = await promisify(doc.getInfo)();
  var andrSheet = info.worksheets[0];
  var webSheet = info.worksheets[1];
  var embdSheet = info.worksheets[2];
  var ardSheet = info.worksheets[3];
  var rasSheet = info.worksheets[4];
  var row = {
    name : req.body.name,
    email : req.body.email,
    phone : `'+20` + req.body.phone,
    university : req.body.university,
    faculty : req.body.faculty,
    year : req.body.year? req.body.year : "other",
    priority : 'First'
  }

  if(req.body.pre1 == 'Android')
  {
    await promisify(andrSheet.addRow)(row);
  }
  else if(req.body.pre1 == 'Web')
  {
    await promisify(webSheet.addRow)(row);
  }
  else if(req.body.pre1 == 'Arduino')
  {
    await promisify(ardSheet.addRow)(row);
  }
  else if(req.body.pre1 == 'Rasberry Pi')
  {
    await promisify(rasSheet.addRow)(row);
  }
  else
  {
    await promisify(embdSheet.addRow)(row);
  }
  row.priority = 'Second';

  if(req.body.pre2 == 'Android')
  {
    await promisify(andrSheet.addRow)(row);
  }
  else if(req.body.pre2 == 'Web')
  {
    await promisify(webSheet.addRow)(row);
  }
  else if(req.body.pre2 == 'Arduino')
  {
    await promisify(ardSheet.addRow)(row);
  }
  else if(req.body.pre2 == 'Rasberry Pi')
  {
    await promisify(rasSheet.addRow)(row);
  }
  else
  {
    await promisify(embdSheet.addRow)(row);
  }

}


//navigation
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
})

app.get('/success', function(req, res){
  res.sendFile(__dirname+'/success.html');
})

app.post('/', urlencodedParser, function (req, res) {
    console.log(req.body);

    //insertion mysql
    /*
    let stmt = `INSERT INTO registrant(name, email, phone, university,	faculty,	year,	first_pref,	second_pref)
    VALUES(?,?,?,?,?,?,?,?)`;
    let registerant = [req.body.name , req.body.email, '+20' + req.body.phone, req.body.university, 
      req.body.faculty, req.body.year? req.body.year : "other", req.body.pre1, req.body.pre2];
    connection.query(stmt, registerant, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
    });
    */

    //insert the data in the spreadsheet
    accessSpreadSheet(req);

    //prepare the mail and send it
    let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
          // should be replaced with real sender's account
          user: 'test@gmail.com',
          pass: 'test'
      }
    });
    let mailOptions = {
        to: req.body.email,
        subject: "IEEE Workshop Registration",
        text : `Hello ${req.body.name},\nThank you for registering, You have selected ${req.body.pre1} as your first preference and ${req.body.pre2} as Your second preference, you'll be contacted soon for your interview.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });


    return res.redirect('/success');

  })

app.listen(3000);

