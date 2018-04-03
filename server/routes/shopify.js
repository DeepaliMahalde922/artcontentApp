/**
 * Routes for express app
 */
import _ from 'lodash';
import crypto from 'crypto';
import express from 'express';
import ShopifyToken from 'shopify-token';
import ShopifyApi from 'shopify-api-node';
import logger from 'winston';

var shopifyAPI = require('shopify-node-api');

var promise = require('bluebird');
var moment = require('moment');
var options = {
  // Initialization Options
  promiseLib: promise,
  query: e => {
    console.log(e.query);
  }
};

var pgp = require('pg-promise')(options);

var connectionString = 'postgres://lscbefdvgkkhho:5d5e622a66aa9345ac0120284caca5f4351d3c024497c2a8cd031dc55709fbe7@ec2-23-21-121-220.compute-1.amazonaws.com:5432/d88e3905stiaec?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory';
//var connectionString = 'postgres://lscbefdvgkkhho:5d5e622a66aa9345ac0120284caca5f4351d3c024497c2a8cd031dc55709fbe7@ec2-23-21-121-220.compute-1.amazonaws.com/d88e3905stiaec';
var pdb = pgp(connectionString);



import {
  ACTIVATE_CHARGE_ROUTE,
  APP_HOME_ROUTE,
  APP_NAME,
  APP_URL,
  AUTH_CALLBACK_ROUTE,
  INSTALL_PAGE,
  SCOPES,
  UNINSTALL_ROUTE
} from '../config';

import { Models } from '../db';

const { Shop } = Models;

const router = express.Router();

export default () => {
  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = process.env;

  const getShopifyToken = () =>
    new ShopifyToken({
      sharedSecret: SHOPIFY_API_SECRET,
      redirectUri: `${APP_URL}${AUTH_CALLBACK_ROUTE}`,
      scopes: SCOPES,
      apiKey: SHOPIFY_API_KEY
    });

  const getAppsHome = shop => `https://${shop}/admin/apps/`;

  // The home page of the app in Shopify Admin
  const getEmbeddedAppHome = shop => `${getAppsHome(shop)}${APP_NAME}`;

  /**
   * Authenticates the shop with Shopify when accessing protected routes.
   * Returns a template file that redirects to the Shopify authorization page.
   * This mechanism is used to authorize an embedded app.
   * We need custom Javascript to escape the iframe as described in the docs.
   * See the "shopify_redirect" template for details.
   */
  const authenticate = (req, res) => {
    const { query, session } = req;

    const shop = query.shop || req.body.shop;

    logger.info('Authenticating shop %s', shop);

    if (!shop) {
      res.redirect(INSTALL_PAGE);
      return;
    }

    const shopifyToken = getShopifyToken();
    const nonce = shopifyToken.generateNonce();

    // Save the nonce to state to verify it in the callback route later on
    session.state = nonce;

    const shopName = shop.split('.')[0];

    const url = decodeURI(
      shopifyToken.generateAuthUrl(shopName, undefined, nonce)
    );

    res.render('shopify_redirect', { url, shop });
  };

  /**
   * Creates an interface for accessing the Shopify API.
   * @param session A Shopify session with shop domain and access token
   */
  const getShopifyApi = session => {
    const { shopify: { shop: shopUrl, token } } = session;

    return new ShopifyApi({
      shopName: shopUrl.split('.')[0],
      accessToken: token
    });
  };

  /**
   * This method gets called when the app is installed.
   * Setup any webhooks or services you need on Shopify inside here.
   *
   * @param session New session
   */
  const afterShopifyAuth = session => {
    const shopify = getShopifyApi(session);

    const webhook = {
      topic: 'app/uninstalled',
      address: `${APP_URL}${UNINSTALL_ROUTE}`,
      format: 'json'
    };

    shopify.webhook.create(webhook);
  };



router.get('/api/appcharges', function (req, res, next) {

    const shop = req.query.updateque; // $_GET["id"]
    const articleId = req.query.articleId; // $_GET["id"]
    if(shop){
        pdb.one('select token from shopstoken where domain = $1', shop)
        .then(function (data) {
            if(data){

                const token = data.token;

               // const { session: { shopify: { shop, token } } } = req;
                const shopifyToken = getShopifyToken();
                const nonce = shopifyToken.generateNonce();

                console.log(nonce);


                var Shopify = new shopifyAPI({
                  shop: shop, // MYSHOP.myshopify.com 
                  shopify_api_key: SHOPIFY_API_KEY, // Your API key 
                  shopify_shared_secret: SHOPIFY_API_SECRET, // Your Shared Secret 
                  shopify_scope: SCOPES,
                  access_token: token,
                  redirect_uri: `${APP_URL}`,
                  nonce: nonce // you must provide a randomly selected value unique for each authorization request 
                });

                console.log(Shopify);
                
                var application_charge = 
                {
                    'application_charge':{
                        "name": APP_NAME,
                        "price": 100.0,
                        "return_url": APP_URL,
                        "test": true    
                    }
                };

                var dataReturn  = '';
                Shopify.get('/admin/application_charges.json', function(err, response, headers){  
                    console.log('1 Step');
                    var myObj = JSON.stringify(response);
                    var responseData = JSON.parse(myObj);
                    if(responseData.application_charges.length === 0){

                        dataReturn = 'false';
                        firsTimeAppcharges(dataReturn, shop, application_charge)
                    }else{
                        dataReturn = 'true';
                        statusAppcharges(dataReturn, response, shop, application_charge);
                    }
                });

                function generateArticlesoShopify(blogId, articleId, message, shop){

                    pdb.one('select * from cparticle where articleid = $1', articleId)
                        .then(function (data) {
                            if(data){
                                const title = data.title;
                                const content = data.content;

                                var time = moment();
                                var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');

                                var articleContent = 
                                {
                                    'article':{
                                        "title": title,
                                        "author": "testapp999",
                                        "tags": "This Post, Has Been Created by testapp999",
                                        "body_html": content,
                                        "published_at": time_format,
                                        "published": true
                                    }
                                };

                                Shopify.post('/admin/blogs/'+blogId+'/articles.json', articleContent, function(err, response, headers, next){

                                    let activeresponse = {
                                        returnURL: `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`,
                                        message: message,
                                        postStatus: 'success'
                                    }

                                    res.status(200).json(activeresponse);
                                });
                            }
                        })
                    .catch(function (err) {
                        let activeresponse = {
                            message: message,
                            postStatus: 'Somwthing went wrong'
                        }
                        res.status(200).json(activeresponse);
                    });
                        
                }


                function firsTimeAppcharges(dataReturn, shop, application_charge){
                    console.log('1 Enter');
                    if(dataReturn == 'false'){
                        Shopify.post('/admin/application_charges.json', application_charge, function(err, response, headers, next){
                            console.log('2 Step');
                            var myObj = JSON.stringify(response);
                            var responseData = JSON.parse(myObj);
                            var confirmation_url = responseData.application_charge.confirmation_url;

                            let chargeCreatedresponse = {
                                returnURL: confirmation_url,
                                message: 'chargeCreated'
                            }
                            res.status(200).json(chargeCreatedresponse);                         
                        });
                    }            
                }

                function statusAppcharges(dataReturn, responseData, shop, application_charge){
                    console.log('2 Enter');
                    if(dataReturn == 'true'){
                        var myObj = JSON.stringify(responseData);
                        var responseData = JSON.parse(myObj);
                        var returnUrl = '';
                        var confirmation_url = '';
                        var status = '';
                        var chargeID = '';
                        responseData.application_charges.forEach(function(item) {
                            var chunkData = JSON.stringify(item);
                            var chunkedData = JSON.parse(chunkData);

                            console.log(chunkedData);
                            confirmation_url = chunkedData.confirmation_url;
                            status = chunkedData.status;
                            chargeID = chunkedData.id;
                            returnUrl = chunkedData.decorated_return_url;
                        });

                        console.log('TTTT: '+confirmation_url);
                        if(status == 'active'){
                            let activeresponse = {
                                returnURL: `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`,
                                message: 'active',
                                postStatus: 'Error 2'
                            }
                            Shopify.get('/admin/blogs.json', function(err, response, headers){
                                console.log('3 Step');
                                var chunkData = JSON.stringify(response);
                                var blogData = JSON.parse(chunkData);
                                let blogId = response.blogs[0].id;
                                console.log(blogId);

                                if(blogId && articleId){
                                    let message = 'active';
                                    generateArticlesoShopify(blogId, articleId, message, shop);
                                }else{
                                    res.status(200).json(activeresponse);    
                                }
                            });
                        }
                        else if(status == 'accepted'){
                            var application_charge = 
                            {
                                'application_charge':{
                                    "name": APP_NAME,
                                    "status": "accepted",
                                    "price": 100.0,
                                    "return_url": APP_HOME_ROUTE,
                                    "test": true    
                                }
                            };
                            Shopify.post('/admin/application_charges/'+chargeID+'/activate.json', application_charge, function(err, response, headers, next){
                                console.log('4 Step');
                                let acceptedresponse = {
                                    returnURL: `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`,
                                    message: 'accepted',
                                    postStatus: 'Error 3'
                                }                                
                                Shopify.get('/admin/blogs.json', function(err, response, headers){
                                    var chunkData = JSON.stringify(response);
                                    var blogData = JSON.parse(chunkData);
                                    let blogId = response.blogs[0].id;
                                    console.log(blogId);

                                    if(blogId && articleId){
                                        let message = 'accepted';
                                        generateArticlesoShopify(blogId, articleId, message, shop);
                                    }else{
                                        res.status(200).json(activeresponse);    
                                    }
                                });
                            });
                        }
                        else if(status == 'pending'){
                            console.log('5 Step');
                            let pendingresponse = {
                                returnURL: confirmation_url,
                                message: 'pending'
                            }
                            res.status(200).json(pendingresponse);
                        }
                        /*else if(status == 'declined'){
                            console.log('6 Step');
                            console.log(confirmation_url);

                            let declinedresponse = {
                                returnURL: confirmation_url,
                               // returnURL: `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`,
                                message: 'declined'
                            }
                            res.status(200).json(declinedresponse);
                        }*/
                        
                    }            
                }


            }                
        })
    }
        
}); 


/*getAllRequest*/
router.get('/api/getarticles', (req, res) => {

    const shop = req.query.updateque;
    if(shop != 'all'){
        const shopurl  = 'https://'+shop;
        pdb.any('select * from bloglist where shopurl = $1', shopurl)
        //pdb.any('select * from bloglist')
        .then(function (data) {
            res.status(200)
              .json({
                status: 'success',
                data: data,
                message: 'Retrieved article'
              });
          })
        .catch(function (err) {
            res.status(500)
            .json({
                status: 'error',
                message: err
            });
        });
    }else if(shop == 'all'){
      const shopurl  = 'https://'+shop;
      pdb.any('select * from bloglist')
      .then(function (data) {
          res.status(200)
            .json({
              status: 'success',
              data: data,
              message: 'Retrieved ALL articles'
            });
        })
      .catch(function (err) {
          res.status(500)
          .json({
              status: 'error',
              message: err
          });
      });
    }else{
      res.status(500)
      .json({
          status: 'error',
          message: 'Something went worng'
      });
    }
    
});

/*get Single Request*/
router.get('/api/getsinglearticles/:id', (req, res) => {
    var id = req.params.id.replace(':', '');
    var artId = parseInt(id);
    console.log(artId);
    var revStaus = 'true';
    if(artId){
    pdb.one('select revision from bloglist where revisionstatus=$1 AND id = $2', [ revStaus ,artId])
    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          data: data.revision,
          message: 'Retrieved ONE puppy'
        });
    }, function (reason) {
      console.log(reason); // print error;
      //return next(reason);
      res.status(200)
        .json({
          status: 'Error',
          message: 'No data returned from the query.'
        });
    }).catch(function (err) {
      res.status(200)
        .json({
          status: 'Error',
          message: err
        });
    });
    }
});


/*createRequest*/
router.post('/api/newarticles', (req, res) => {  
    var obj = req.body;
    var time = moment();
    var time_format = time.format('YYYY-MM-DD HH:mm:ss Z'); 
   // var describe = contenType = productData = shopUrl = '';
    obj.data.forEach(function(item) {
      console.log(item.shopurl);

        const describe = item.describe;
        const shopUrl = item.shopUrl;
        const contenType = JSON.stringify(item.contenType);
        const productData = JSON.stringify(item.productData);

        if(shopUrl && describe && productData && contenType){
          pdb.one("insert into bloglist(shopurl, describe, contenType, productData, createdat)" +
            "values ($1, $2, $3, $4, $5)"
            +"returning id", [shopUrl, describe, contenType, productData, time])
          .then(function (data) {
              res.status(200)
              .json({
                status: 'success',
                data: data,
                message: 'Recivied ONE Entry'
              });
              
          }, function (reason) {
              //console.log('Insert into /locations failed for ', reason); // print error;
              return next(reason);
          });
        }else{
          res.status(404)
          .json({
            status: 'Error',
            message: 'Fields are empty.'
          });
        }

    });
});


/*updateRequest*/
router.put('/api/updatearticles/:id', (req, res) => {  
    var id = req.params.id.replace(':', '');
    var obj = req.body;

    pdb.none('update bloglist set revision=$1, revisionstatus=$2 where id=$3',
    [obj.data, 'true', parseInt(id)])
    .then(function (data) {
        //console.log(obj.data); // print result;
        res.status(200)
        .json({
            status: 'success',
            message: 'Updated Request'
        });
    }, function (reason) {
        console.log('Insert into /locations failed for ', reason); // print error;
      //return next(reason);
    })
    .catch(function (err) {
        res.status(500)
        .json({
            status: 'error',
            message: err
        });
    });
});


/*getsingleArticle*/
router.get('/api/article/:id', (req, res) => {
  var id = req.params.id.replace(':', '');
  var artId = parseInt(id);
  console.log(artId);
  if(artId){
    pdb.one('select * from cparticle where articleid = $1', artId)
    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE puppy'
        });
    }, function (reason) {
      console.log(reason); // print error;
      //return next(reason);
      res.status(200)
        .json({
          status: 'Error',
          message: 'No data returned from the query.'
        });
    }).catch(function (err) {
      res.status(200)
        .json({
          status: 'Error',
          message: err
        });
    });
  }
});


/*generateArticle*/
router.post('/api/generatearticle', (req, res) => {
  var obj = req.body;
  var time = moment();
  var time_format = time.format('YYYY-MM-DD HH:mm:ss Z'); 
  
  obj.data.forEach(function(item) {

    const articleid = item.articleid;
    const title = item.title;
    const content = item.content;
    var revStaus = 'false';
    var articleStaus = 'true';

    if(articleid && title && content){

        pdb.one('select * from cparticle where articleid = $1', articleid)
        .then(function (data) {

            pdb.none('update cparticle set title=$1, content=$2, createdat=$3 where articleid=$4', 
                [title, content, time, parseInt(articleid)])
            .then(function (data) {
              
              /*Update revisionstatus to false*/
              pdb.none('update bloglist set revisionstatus=$1, articlestatus=$2 where id=$3',[revStaus, articleStaus, parseInt(articleid)])
              .then(function (data) {/*console.log(data);*/ },
              function (reason) {/*console.log(reason);*/ })
              .catch(function (err) {});

              res.status(200)
              .json({
                status: 'success',
                data: data,
                message: 'Recivied ONE Entry'
              });
              
            }, function (reason) {
              console.log('11TT: '+reason); // print error;
              //return next(reason);
            }).catch(function (err) {
              res.status(404)
              .json({
                  status: 'Error',
                  message: 'Fields are empty.'
              });
            });

        }, function (reason) {
          console.log(reason); // print error;

          pdb.one("insert into cparticle(articleid, title, content, createdat)" +
          "values ($1, $2, $3, $4)"
          +"returning id", [articleid, title, content, time])
          .then(function (data) {
            //console.log(obj); // print result;

            /*Update revisionstatus to false*/
            pdb.none('update bloglist set revisionstatus=$1, articlestatus=$2 where id=$3',[revStaus, articleStaus, parseInt(articleid)])
            .then(function (data) {/*console.log(data);*/ },
            function (reason) {/*console.log(reason);*/ })
            .catch(function (err) {});

            res.status(200)
            .json({
              status: 'success',
              data: data,
              message: 'Recivied ONE Entry'
            });
            
          }, function (reason) {
            console.log('22TT: '+reason); // print error;
            //return next(reason);
          }).catch(function (err) {
            res.status(404)
            .json({
                status: 'Error',
                message: 'Fields are empty.'
            });
          });
          
        }).catch(function (err) {
          
        });


      
    }else{
      res.status(404)
      .json({
        status: 'Error',
        message: 'Fields are empty.'
      });
    }

  });
});




  /**
   * Shopify calls this route after the merchant authorizes the app.
   * It needs to match the callback route that you set in app settings.
   */
  router.get(AUTH_CALLBACK_ROUTE, (req, res, next) => {

    console.log('Request: '+req);
    const { query, session } = req;
    const { code, shop, state } = query;
    const shopifyToken = getShopifyToken();

    // Exchange the authorization code for a permanent access token.
    return shopifyToken
      .getAccessToken(shop, code)
      .then(token => {
        session.shopify = { shop, token };

        pdb.one('select token from shopstoken where domain = $1', shop)
        .then(function (data) {
            if(data){
                pdb.one('delete from shopstoken where domain = $1', shop)
                .then(function (result) {
                }).catch(function (err) {
                    pdb.one("insert into shopstoken(domain, token)" +
                      "values ($1, $2)"
                      +"returning id", [shop, token])
                    .then(function (data) {
                        console.log(data);
                    });
                });

            }                
        })
        .catch(function (err) {
            pdb.one("insert into shopstoken(domain, token)" +
              "values ($1, $2)"
              +"returning id", [shop, token])
            .then(function (data) {
                console.log(data);
            });
        });


        return Shop.findOrCreate({
          where: {
            domain: shop
          }
        }).spread(() => {
          afterShopifyAuth(session);
          req.shopify = getShopifyApi(session);
          return res.redirect('https://'+shop+'/admin/apps/'+SHOPIFY_API_KEY);
        });
      })
      .catch(next);
  });

  const verifyWebhookHMAC = req => {
    const hmac = req.headers['x-shopify-hmac-sha256'];

    const digest = crypto
      .createHmac('SHA256', SHOPIFY_API_SECRET)
      .update(req.rawBody)
      .digest('base64');

    return digest === hmac;
  };

  /**
   * This endpoint recieves the uninstall webhook and cleans up data.
   * Add to this endpoint as your app stores more data. If you need to do a lot of work, return 200
   * right away and queue it as a worker job.
   */
  router.post(UNINSTALL_ROUTE, (req, res) => {
    if (!verifyWebhookHMAC(req)) {
      res.status(401).send('Webhook HMAC Failed');
      return;
    }

    Shop.destroy({
      where: {
        domain: req.headers['x-shopify-shop-domain']
      }
    }).then(() => {
      res.status(200).send('Uninstalled');
    });
  });

  /**
   * This middleware checks if we have a session.
   * If so, it attaches the Shopify API to the request object.
   * If there is no session or we have a different shop,
   * we start the authentication process.
   */
  const authMiddleware = (req, res, next) => {
    logger.info(`Checking for valid session: ${req.query.shop}`);
    const { session, query: { shop } } = req;

    if (!session.shopify || (shop && session.shopify.shop !== shop)) {
      delete session.shopify;
      authenticate(req, res);
      return;
    }

    req.shopify = getShopifyApi(session);
    next();
  };

  router.use(authMiddleware);

  /*
   * Shopify calls this route when the merchant accepts or declines the charge.
   */
  router.get('/activate_charge', (req, res, next) => {
    const {
      shopify: { recurringApplicationCharge },
      query: { charge_id: chargeId },
      session: { shopify: { shop } }
    } = req;

    recurringApplicationCharge
      .get(chargeId)
      .then(charge => {
        if (charge.status === 'accepted') {
          return recurringApplicationCharge.activate(chargeId).then(() =>
            // We redirect to the home page of the app in Shopify admin
            res.redirect(getEmbeddedAppHome(shop))
          );
        }
        res.status(401);
        return res.render('charge_declined', { APP_URL });
      })
      .catch(next);
  });

  router.get('/logout', (req, res) => {
    const { shop } = req.session.shopify;

    delete req.session.shopify;

    res.redirect(getAppsHome(shop));
  });

  router.get('/api/orders', (req, res) => {
    const { shopify } = req;
    console.log(shopify);

    shopify.order.list({ limit: 5 }).then(orders => {
      res.status(200).json(orders);
    });
  });

  /**
   * Checks if we have an active application charge.
   * This middleware is active when the app is initially loaded.
   */
  const checkActiveRecurringApplicationCharge = (req, res, next) => {
    logger.info(`Checking for active application charge: ${req.query.shop}`);
    const { shopify } = req;
    next();
  };

  /*
   * Checks if the session is still valid by making a basic API call, as described in:
   * https://stackoverflow.com/questions/14418415/shopify-how-can-i-handle-an-uninstall-followed-by-an-instant-re-install
   */
  const checkForValidSession = (req, res, next) => {
    logger.info(`Checking if the session is still valid: ${req.query.shop}`);
    const { session, shopify } = req;

    return shopify.shop
      .get()
      .then(() => next())
      .catch(() => {
        // Destroy the Shopify reference
        delete session.shopify;
        authenticate(req, res);
      });
  };

  router.get(
    APP_HOME_ROUTE,
    checkForValidSession,
  //  checkActiveRecurringApplicationCharge,
    (req, res) => {
      res.redirect('/');
    }
  );

  return router;
};
