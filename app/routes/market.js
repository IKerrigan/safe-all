let express = require('express');
let bodyParser = require('body-parser');
const crypto = require('crypto');

let  market = express.Router();

const storage = require("../modules/storage");
const mongoose = require('mongoose');


var _ = require('lodash');
var _ = require('lodash/core');
var fp = require('lodash/fp');
var array = require('lodash/array');

market.get('/sell',function(req,res){
    res.redirect('/market/sell/0');
});

market.get('/sell/:pageId',function(req,res){
    let Filter = req.get("Filter") ? req.get("Filter") : "";    
    let page = req.params.pageId ? parseInt(req.params.pageId) : 0;

        storage.Account.find({sell:'true'},(err,data)=>{
            
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
                    nextPage : '/market/sell/' + Number.parseInt(page + 1),
                    prevPage : '/market/sell/' + prevPage
                });
            }else{
                res.json({
                    err : 'No such page',
                    help : 'Try link in prevPage',                   
                    prevPage : '/market/sell/' + prevPage
                    
                });
            }
        });
 });

 module.exports = market;