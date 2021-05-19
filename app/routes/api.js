let express = require('express');
let bodyParser = require('body-parser');
const crypto = require('crypto');
var basicAuth = require('express-basic-auth')


let  api = express.Router();

const storage = require("../modules/storage");
const mongoose = require('mongoose');


var _ = require('lodash');
var _ = require('lodash/core');
var fp = require('lodash/fp');
var array = require('lodash/array');



api.use(basicAuth({
    authorizer: myAsyncAuthorizer,
    authorizeAsync: true,
    unauthorizedResponse: getUnauthorizedResponse
}));


/**
 * @apiDefine UserNotFoundError
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "err": "Only for authorized"
 *     }
 */

function getUnauthorizedResponse(req) {
    let cred = req.auth ?
        ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected') :
        ('Only for authorized')
        return {
            err : cred
        }
}

function myAsyncAuthorizer(username, password, cb) {
    storage.User.find({username:username , password:sha512(password,serverSalt).passwordHash},
     (err,data)=>{
         let user = data[0];
        if(!user)
        return cb('No user')
    else
        return cb(null,user)
    });
}

const serverSalt = "as&@!*(#Yisajd/,,<";

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};


/**
 * @api {get} / Welcoming speech
 * @apiName Welcome
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "msg": "Welcome to our rest api!Please specify your request!",
 *     }
 */ 
api.get('/',function(req,res){
   res.json({error: "Welcome to our rest api!Please specify your request!"});
});

api.get('/myaccounts',function(req,res){
    res.redirect('/api/v1/myaccounts/0');
})

/**
 * @api {get} /myaccounts/:pageId Request User accounts
 * @apiName GetAccounts
 * @apiGroup User
 *
 * @apiParam {Number} id Pages unique ID.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *       {
                    accounts : [],
                    page : Number,
                    nextPage : '/api/v1/myaccounts/' + Number,
                    prevPage : '/api/v1/myaccounts/' + Number
         }
 *
 * @apiUse UserNotFoundError
 */

api.get('/myaccounts/:pageId',function(req,res){
    let Filter = req.get("Filter") ? req.get("Filter") : "";    
    let page = req.params.pageId ? parseInt(req.params.pageId) : 0;

    storage.User.find({username : req.auth.user, password : sha512(req.auth.password,serverSalt).passwordHash},
    (err,data)=>{
        storage.Account.find({authorId : data[0]._id},(err,data)=>{
            
            let temp;

            if(Filter){
                let arr = [];
                for(let dat of data){
                    if(String(dat.title).toLowerCase().match(Filter.toLowerCase())){
                        arr.push(dat);
                    }
                }
                temp = array.chunk(arr,3);                
            }else{
                temp = array.chunk(data,3);                
            }

            let prevPage = Number.parseInt(page - 1);
            if(prevPage === -1){
                prevPage = 0;
            }

            if(temp.length >= page){
                res.json({
                    accounts : temp[page],
                    page : page,
                    nextPage : '/api/v1/myaccounts/' + Number.parseInt(page + 1),
                    prevPage : '/api/v1/myaccounts/' + prevPage
                });
            }else{
                res.json({
                    err : 'No such page',
                    help : 'Try link in prevPage',                   
                    prevPage : '/api/v1/myaccounts/' + prevPage
                    
                });
            }
        });
    });    
 });

 /**
 * @api {post} /create Create new account for User
 * @apiName CreateAcc
 * @apiGroup User
 *
 * @apiParam {Number} [importance]          
 * @apiParam {String} title
 * @apiParam {String} login 
 * @apiParam {String} password 
 * @apiParam {String} [description]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {msg: "Created successfuly",
 * account : account
 * }
 *
 * @apiUse UserNotFoundError
 */

 api.post('/create',function(req,res){
    storage.User.find({username : req.auth.user, password : sha512(req.auth.password,serverSalt).passwordHash},
     (err,data)=>{

        let account = new storage.Account({
            authorId: data[0]._id,
            title: req.body.title,
            login : req.body.login,
            password : req.body.password,
            description : req.body.description,
            importance : req.body.importance
        });
        try {
            storage.Account.count({authorId : data[0]._id}, function(err, c) {
                if(data[0].role === "user"){
                    if(c<=4){
                        account.save();
                    }
                }else{
                    account.save();                
                }
                res.json({msg: "Created successfuly",account : account});            
            }); 
            
        } catch (e) {
            res.json({msg: "Error.Try again later."});            
        }

    });
 });

 /**
 * @api {post} /remove/:remId Request User information
 * @apiGroup User
 *
 * @apiParam {String} Unique account id          
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "msg" : 'Success'
 *     }
 *
 */

 api.post('/remove/:remId',function(req,res){
    storage.User.find({username : req.auth.user, password : sha512(req.auth.password,serverSalt).passwordHash},
     (err,data)=>{
        storage.Account.remove({ _id: req.params.remId , authorId : data[0]._id }, function(err) {
                if(!err){
                    res.json({msg : 'Success'});                                        
                }else{
                    res.json({err : err});
                }
        });
 });
});

/**
 * @api {get} /info Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 *
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user" : user
 *     }
 *
 */
 api.get('/info',function(req,res){
    storage.User.find({username : req.auth.user, password : sha512(req.auth.password,serverSalt).passwordHash},
    (err,data)=>{
        res.json({
            user : data[0]
        });
    });
 });

 api.get('/users',function(req,res){
    storage.User.find({username : req.auth.user, password : sha512(req.auth.password,serverSalt).passwordHash},
    (err,data)=>{
            if(data[0].role === 'admin'){
                storage.User.find({},
                (err,data1)=>{
                res.json({
                    user : data1
                });
            });
        }
    });
 });
    


module.exports = api;