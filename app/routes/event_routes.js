module.exports = function(app, db) {
    app.post('/register', (req, res) => {
        const bcrypt = require('bcrypt');
        const saltRounds =10;
        const test = req.body.email
        const cName = req.body.collectionName;
        const genre = req.body.genre;
        var hash = bcrypt.hashSync(req.body.passwd, saltRounds);
        var res2 = db.search(req.body.email)

        if(res2 ==null){
            var result = db.add(req.body.email,hash,cName,genre)
            if(result!= null){
                res.send("Added user sucessfully...")
            }
            else{
                res.send("error in registering the user..")
            }
        }
        else{
            res.send("user already exists")
        }
        
    });

    app.get('/login', (req,res)=>{
        const bcrypt = require('bcrypt');
        var email = req.body.email
        var passwdentred = req.body.passwd
        var getval = db.search(email)
        //console.log(getval)
        if(getval == null){
            res.send("no such emailId exists")
        }
        else{
            if(bcrypt.compareSync(passwdentred, getval.password) )
                {
                    req.session.user_id = email;
                    res.send("logged in sucess!")
                }
                else{
                    res.send("incorrect password")
                }
        }
        
    });

    app.get('/getEvents',checkAuth, (req,res)=>{
        var https = require('https')
        var myObj = db.search(req.session.user_id)
        const cName = myObj.classificationName
        const genreId = myObj.genreId
        var options = {
            host: 'yv1x0ke9cl.execute-api.us-east-1.amazonaws.com',
            port: 443,
            path: '/prod/events?classificationName='+cName+'&genreId='+genreId,
            // authentication headers
            headers: {
               'Authorization': 'Basic ' + new Buffer('stitapplicant' + ':' + 'zvaaDsZHLNLFdUVZ_3cQKns').toString('base64')
            }   
         };
         var eventMsg ;
         //this is the call
         request = https.get(options, function(res){
            var body = "";
            res.on('data', function(data) {
               body += data;
            });
            res.on('end', function() {
               eventMsg = body;
            })
            res.on('error', function(e) {
               console.log("Got error: " + e.message);
            });
             });
           
    });

    app.post('/setPreferences',checkAuth, (req,res)=>{
        console.log("updating...")
        const email = req.session.user_id;
        var myObj = db.search(email)
        if(!myObj)
        {
            res.send("unable to find log in info")
        }
        const cName = req.body.classificationName
        const newpref = req.body.genre
        var getval = db.update(email,cName,newpref)
        if(getval){
            res.send("updated sucessfully..")
        }
    });

};

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
      res.send('You are not authorized to view this page');
      //res.redirect('/login')
    } else {
      next();
    }
  }