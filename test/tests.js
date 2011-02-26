var fbsdk = require('../lib/facebook'),
	http = require('http'),
	querystring = require('querystring');

var APP_ID = '117743971608120';
var SECRET = '943716006e74d9b9283d4d5d8ab93204';

var MIGRATED_APP_ID = '174236045938435';
var MIGRATED_SECRET = '0073dce2d95c4a5c2922d1827ea0cca6';

var VALID_EXPIRED_SESSION = {
	access_token : '117743971608120|2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385|NF_2DDNxFBznj2CuwiwabHhTAHc.',
	expires      : '1281049200',
	secret       : 'u0QiRGAwaPCyQ7JE_hiz1w__',
	session_key  : '2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385',
	sig          : '7a9b063de0bef334637832166948dcad',
	uid          : '1677846385'
};

var VALID_SIGNED_REQUEST = '1sxR88U4SW9m6QnSxwCEw_CObqsllXhnpP5j2pxD97c.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImV4cGlyZXMiOjEyODEwNTI4MDAsIm9hdXRoX3Rva2VuIjoiMTE3NzQzOTcxNjA4MTIwfDIuVlNUUWpub3hYVVNYd1RzcDB1U2g5d19fLjg2NDAwLjEyODEwNTI4MDAtMTY3Nzg0NjM4NXx4NURORHBtcy1nMUM0dUJHQVYzSVdRX2pYV0kuIiwidXNlcl9pZCI6IjE2Nzc4NDYzODUifQ';
var NON_TOSSED_SIGNED_REQUEST = 'c0Ih6vYvauDwncv0n0pndr0hP0mvZaJPQDPt6Z43O0k.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiJ9';

exports.testConstructor = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	test.equal(facebook.appId, APP_ID, 'Expect the App ID to be set.');
	test.equal(facebook.secret, SECRET, 'Expect the API secret to be set.');
	test.ok(!facebook.cookieSupport, 'Expect Cookie support to be off.');
	test.done();
};

exports.testConstructorWithCookie = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET,
		cookie : true
	});
	test.equal(facebook.appId, APP_ID, 'Expect the App ID to be set.');
	test.equal(facebook.secret, SECRET, 'Expect the API secret to be set.');
	test.ok(facebook.cookie, 'Expect Cookie support to be on.');
	test.done();
};

exports.testConstructorWithFileUpload = function(test) {
	var facebook = new fbsdk.Facebook({
		appId      : APP_ID,
		secret     : SECRET,
		fileUpload : true
	});
	test.equal(facebook.appId, APP_ID, 'Expect the App ID to be set.');
	test.equal(facebook.secret, SECRET, 'Expect the API secret to be set.');
	test.ok(facebook.fileUpload, 'Expect file upload support to be on.');
	test.done();
};

exports.testSetAppId = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.appId = 'dummy';
	test.equal(facebook.appId, 'dummy', 'Expect the App ID to be dummy.');
	test.done();
};

exports.testSetAPISecret = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.secret = 'dummy';
	test.equal(facebook.secret, 'dummy', 'Expect the API secret to be dummy.');
	test.done();
};

exports.testDefaultBaseDomain = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET,
		domain : 'fbrell.com'
	});
	test.equal(facebook.domain, 'fbrell.com');
	test.done();
};

exports.testSetCookieSupport = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	test.ok(!facebook.cookie, 'Expect Cookie support to be off.');
	facebook.cookie = true;
	test.ok(facebook.cookie, 'Expect Cookie support to be on.');
	test.done();
};

//  exports.testIgnoreDeleteSetCookie = function(test) {
//    var facebook = new fbsdk.Facebook({
//      appId  : APP_ID,
//      secret : SECRET,
//      cookie : true,
//    });
//    cookieName = 'fbs_' . APP_ID;
//    test.ok(!isset(_COOKIE[cookieName]), 'Expect Cookie to not exist.');
//    facebook.setSession(null);
//    test.ok(!isset(_COOKIE[cookieName]), 'Expect Cookie to not exist.');
//  }

exports.testSetFileUploadSupport = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	test.ok(!facebook.fileUploadSupport, 'Expect file upload support to be off.');
	facebook.fileUploadSupport = true;
	test.ok(facebook.fileUploadSupport, 'Expect file upload support to be on.');
	test.done();
};

exports.testSetNullSession = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.setSession(null);
	test.ok(facebook.getSession() === null, 'Expect null session back.');
	test.done();
};

exports.testNonUserAccessToken = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET,
		cookie : true
	});
	test.ok(facebook.getAccessToken() == APP_ID+'|'+SECRET, 'Expect appId|secret.');
	test.done();
};

exports.testSetSession = function(test) {
	test.expect(4);
	
	// the setSession below should call this response.setHeader method
	var response = {
		setHeader: function(name, value) {
			// setting the session sets the cookie (copied from a php-sdk instance)
			test.equal(name, 'Set-Cookie');
			test.equal(value, 'fbs_117743971608120=%22access_token%3D117743971608120%257C2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385%257CNF_2DDNxFBznj2CuwiwabHhTAHc.%26expires%3D1281049200%26secret%3Du0QiRGAwaPCyQ7JE_hiz1w__%26session_key%3D2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385%26sig%3D7a9b063de0bef334637832166948dcad%26uid%3D1677846385%22; expires=Thu, 05 Aug 2010 23:00:00 GMT; path=/; domain=.foo.com');
		}
	};
	
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET,
		response : response,
		domain : 'foo.com'
	});
	facebook.setSession(VALID_EXPIRED_SESSION);
	test.ok(facebook.getUser() == VALID_EXPIRED_SESSION.uid, 'Expect uid back.');
	test.ok(facebook.getAccessToken() == VALID_EXPIRED_SESSION.access_token, 'Expect access token back.');
	test.done();
};

exports.testGetSession = function(test) {
	// regression test: the cookie we set should be getSession-able
	var request = {
		url: '/',
		headers: {
			// cookie copied from the above testSetSession
			cookie: 'fbs_117743971608120=%22access_token%3D117743971608120%257C2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385%257CNF_2DDNxFBznj2CuwiwabHhTAHc.%26expires%3D1281049200%26secret%3Du0QiRGAwaPCyQ7JE_hiz1w__%26session_key%3D2.vdCKd4ZIEJlHwwtrkilgKQ__.86400.1281049200-1677846385%26sig%3D7a9b063de0bef334637832166948dcad%26uid%3D1677846385%22'
		}
	};
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET,
		request: request
	});
	test.deepEqual(facebook.getSession(), VALID_EXPIRED_SESSION);
	test.done();
}

exports.testGetSessionFromCookie = function(test) {
	var cookieName = 'fbs_' + APP_ID;
	var session = VALID_EXPIRED_SESSION;
	var cookie = {};
	cookie[cookieName] = querystring.stringify(session);

	var options = {
		headers: { Cookie: querystring.stringify(cookie) }
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId   : APP_ID,
			secret  : SECRET,
			cookie  : true,
			request : request
		});
		test.deepEqual(facebook.getSession(), session, 'Expect session back.');
		test.done();
	});
};

exports.testInvalidGetSessionFromCookie = function(test) {
	var cookieName = 'fbs_' + APP_ID;
	var session = clone(VALID_EXPIRED_SESSION);
	session.uid = 'make me invalid';
	var cookie = {};
	cookie[cookieName] = querystring.stringify(session);

	var options = {
		headers: { Cookie: querystring.stringify(cookie) }
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId   : APP_ID,
			secret  : SECRET,
			cookie  : true,
			request : request
		});
		test.ok(facebook.getSession() === null, 'Expect no session back.');
		test.done();
	});
};

exports.testSessionFromQueryString = function(test) {
	var options = {
		path: '/?' + querystring.stringify({ session: JSON.stringify(VALID_EXPIRED_SESSION) })
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId   : APP_ID,
			secret  : SECRET,
			request : request
		});
		test.equal(facebook.getUser(), VALID_EXPIRED_SESSION.uid, 'Expect uid back.');
		test.done();
	});
};

exports.testInvalidSessionFromQueryString = function(test) {
	var qs = {
		fb_sig_in_iframe : 1,
		fb_sig_user : '1677846385',
		fb_sig_session_key : '2.NdKHtYIuB0EcNSHOvqAKHg__.86400.1258092000-1677846385',
		fb_sig_ss : 'AdCOu5nhDiexxRDLwZfqnA__',
		fb_sig : '1949f256171f37ecebe00685ce33bf17'
	};
	var options = {
		path: '/?' + querystring.stringify(qs)
	};

	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId   : APP_ID,
			secret  : SECRET,
			request : request
		});
		test.equal(facebook.getUser(), null, 'Expect uid back.');
		test.done();
	});
};

exports.testGetUID = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	var session = VALID_EXPIRED_SESSION;
	facebook.setSession(session);
	test.equal(facebook.getUser(), session.uid, 'Expect dummy uid back.');
	test.done();
};

exports.testAPIWithoutSession = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.api({
		method : 'fql.query',
		query : 'SELECT name FROM user WHERE uid=4'
	}, function(response) {
		test.equal(response.length, 1, 'Expect one row back.');
		test.equal(response[0].name, 'Mark Zuckerberg', 'Expect the name back.');
		test.done();
	});
};

exports.testAPIWithSession = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.setSession(VALID_EXPIRED_SESSION);

	// this is strange in that we are expecting a session invalid error vs a
	// signature invalid error. basically we're just making sure session based
	// signing is working, not that the api call is returning data.
	facebook.api({
		method : 'fql.query',
		query : 'SELECT name FROM profile WHERE id=4'
	}, function(data) {
		test.ok(data.error);

		var msg = 'Exception: 190: Invalid OAuth 2.0 Access Token';
		test.equal(data, msg, 'Expect the invalid session message.');

		var result = data.getResult();
		test.ok(typeof result == 'object', 'expect a result object');
		test.equal(result.error_code, 190, 'expect code');
		test.done();
	});
};

exports.testAPIGraphPublicData = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});

	facebook.api('/naitik', function(response) {
		test.equal(response.id, '5526183', 'should get expected id.');
		test.done();
	});

	// regression test: calling api w/o callback throws TypeError
	facebook.api('/4');
};

exports.testGraphAPIWithSession = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.setSession(VALID_EXPIRED_SESSION);

	facebook.api('/me', function(data) {
		test.ok(data.error);
		// means the server got the access token
		var msg = 'OAuthException: Error validating access token.';
		test.equal(msg, data, 'Expect the invalid session message.');
		// also ensure the session was reset since it was invalid
		test.equal(facebook.getSession(), null, 'Expect the session to be reset.');
		test.done();
	});
};

exports.testGraphAPIMethod = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});

	facebook.api('/naitik', 'DELETE', function(data) {
		test.ok(data.error);
		// ProfileDelete means the server understood the DELETE
		var msg = 'OAuthException: An access token is required to request this resource.';
		test.equal(msg, data, 'Expect the invalid session message.');
		test.done();
	});
};

exports.testGraphAPIOAuthSpecError = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : MIGRATED_APP_ID,
		secret : MIGRATED_SECRET
	});

	facebook.api('/me', { client_id: MIGRATED_APP_ID }, function(data) {
		test.ok(data.error);
		// means the server got the access token
		msg = 'invalid_request: An active access token must be used to query information about the current user.';
		test.equal(msg, data, 'Expect the invalid session message.');
		// also ensure the session was reset since it was invalid
		test.equal(facebook.getSession(), null, 'Expect the session to be reset.');
		test.done();
	});
};

// TODO: I have done something wrong, or the spec has changed
//exports.testGraphAPIMethodOAuthSpecError = function(test) {
//  var facebook = new fbsdk.Facebook({
//    appId  : MIGRATED_APP_ID,
//    secret : MIGRATED_SECRET
//  });
//
//  facebook.api('/daaku.shah', 'DELETE', { client_id: MIGRATED_APP_ID }, function(e) {
//    test.ok(e.error);
//    // ProfileDelete means the server understood the DELETE
//    msg = 'invalid_request: Test account not associated with application: The test account is not associated with this application.';
//    test.equal(msg, e, 'Expect the invalid session message.');
//    test.done();
//  });
//};

exports.testCurlFailure = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});

	// we dont expect facebook will ever return in 1ms
	facebook.CURLOPT_TIMEOUT_MS = 1;
	facebook.api('/naitik', function(data) {
		test.ok(data.error);
		var CURLE_OPERATION_TIMEDOUT = 28;
		test.equal(CURLE_OPERATION_TIMEDOUT, data.code, 'expect timeout');
		test.equal('CurlException', data.getType(), 'expect type');
		test.done();
	});
};

// NOTE: modified to not use an access_token-required api query
exports.testGraphAPIWithOnlyParams = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});

	facebook.api('/' + APP_ID + '/insights', { limit:1 }, function(response) {
		test.equal(1, response.data.length, 'should get one entry');
		test.done();
	});
};

exports.testLoginURLDefaults = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var encodedUrl = querystring.escape('http://fbrell.com/examples');
		test.ok(facebook.getLoginUrl().indexOf(encodedUrl) >= 0, 'Expect the current url to exist.');
		test.done();
	});
};

exports.testLoginURLDefaultsDropSessionQueryParam = function(test) {
	var options = {
		path: '/examples?session=xx42xx'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var expectEncodedUrl = querystring.escape('http://fbrell.com/examples');
		test.ok(facebook.getLoginUrl().indexOf(expectEncodedUrl) >= 0, 'Expect the current url to exist.');
		test.ok(facebook.getLoginUrl().indexOf('xx42xx') == -1, 'Expect the session param to be dropped.');
		test.done();
	});
};

exports.testLoginURLDefaultsDropSessionQueryParamButNotOthers = function(test) {
	var options = {
		path: '/examples?session=xx42xx&do_not_drop=xx43xx'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var expectEncodedUrl = querystring.escape('http://fbrell.com/examples');
		test.ok(facebook.getLoginUrl().indexOf('xx42xx') == -1, 'Expect the session param to be dropped.');
		test.ok(facebook.getLoginUrl().indexOf('xx43xx') >= 0, 'Expect the do_not_drop param to exist.');
		test.done();
	});
};

exports.testLoginURLCustomNext = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var next = 'http://fbrell.com/custom';
		var loginUrl = facebook.getLoginUrl({
			next : next,
			cancel_url : next
		});
		var currentEncodedUrl = querystring.escape('http://fbrell.com/examples');
		var expectedEncodedUrl = querystring.escape(next);
		test.ok(loginUrl.indexOf(expectedEncodedUrl) >= 0, 'Expect the custom url to exist.');
		test.ok(loginUrl.indexOf(currentEncodedUrl) == -1, 'Expect the current url to not exist.');
		test.done();
	});
};

exports.testLogoutURLDefaults = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var encodedUrl = querystring.escape('http://fbrell.com/examples');
		test.ok(facebook.getLogoutUrl().indexOf(encodedUrl) >= 0, 'Expect the current url to exist.');
		test.done();
	});
};

exports.testLoginStatusURLDefaults = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var encodedUrl = querystring.escape('http://fbrell.com/examples');
		test.ok(facebook.getLoginStatusUrl().indexOf(encodedUrl) >= 0, 'Expect the current url to exist.');
		test.done();
	});
};

exports.testLoginStatusURLCustom = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com/',
			request: request
		});
		var encodedUrl1 = querystring.escape('http://fbrell.com/examples');
		var okUrl = 'http://fbrell.com/here1';
		var encodedUrl2 = querystring.escape(okUrl);
		var loginStatusUrl = facebook.getLoginStatusUrl({ ok_session: okUrl });
		test.ok(loginStatusUrl.indexOf(encodedUrl1), 'Expect the current url to exist.');
		test.ok(loginStatusUrl.indexOf(encodedUrl2), 'Expect the custom url to exist.');
		test.done();
	});
};

exports.testNonDefaultPort = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'http://fbrell.com:8080/',
			request: request
		});
		var encodedUrl = querystring.escape('http://fbrell.com:8080/examples');
		test.ok(facebook.getLoginUrl().indexOf(encodedUrl), 'Expect the current url to exist.');
		test.done();
	});
};

exports.testSecureCurrentUrl = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'https://fbrell.com/',
			request: request
		});
		var encodedUrl = querystring.escape('https://fbrell.com/examples');
		test.ok(facebook.getLoginUrl().indexOf(encodedUrl), 'Expect the current url to exist.');
		test.done();
	});
};

exports.testSecureCurrentUrlWithNonDefaultPort = function(test) {
	var options = {
		path: '/examples'
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId  : APP_ID,
			secret : SECRET,
			siteUrl: 'https://fbrell.com:8080/',
			request: request
		});
		var encodedUrl = querystring.escape('https://fbrell.com:8080/examples');
		test.ok(facebook.getLoginUrl().indexOf(encodedUrl), 'Expect the current url to exist.');
		test.done();
	});
};

exports.testAppSecretCall = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	facebook.api('/' + APP_ID + '/insights', function(response) {
		test.ok(response.data.length > 0, 'Expect some data back.');
		test.done();
	});
};

exports.testBase64UrlEncode = function(test) {
	var input = 'Facebook rocks';
	var output = 'RmFjZWJvb2sgcm9ja3M';
	test.equal(fbsdk.Facebook.prototype._base64UrlDecode(output), input);
	test.done();
};

exports.testSignedToken = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	var payload = facebook._parseSignedRequest(VALID_SIGNED_REQUEST);
	test.ok(payload, 'Expected token to parse');
	var session = facebook._createSessionFromSignedRequest(payload);
	test.equal(session.uid, VALID_EXPIRED_SESSION.uid);
	test.equal(facebook.getSignedRequest(), null);

	// test that the actual signed request equals the expected one
	var options = {
		path: '/?' + querystring.stringify({ signed_request: VALID_SIGNED_REQUEST })
	};
	httpServerTest(options, function(request, response) {
		facebook.request =  request;
		test.deepEqual(facebook.getSignedRequest(), payload);
		test.done();
	});
};

exports.testSignedTokenInQuery = function(test) {
	var options = {
		path: '/?' + querystring.stringify({ signed_request: VALID_SIGNED_REQUEST })
	};
	httpServerTest(options, function(request, response) {
		var facebook = new fbsdk.Facebook({
			appId   : APP_ID,
			secret  : SECRET,
			request : request
		});
		test.ok(facebook.getSession());
		test.done();
	});
};

exports.testNonTossedSignedtoken = function(test) {
	var facebook = new fbsdk.Facebook({
		appId  : APP_ID,
		secret : SECRET
	});
	var payload = facebook._parseSignedRequest(NON_TOSSED_SIGNED_REQUEST);
	test.ok(payload, 'Expected token to parse');
	var session = facebook._createSessionFromSignedRequest(payload);
	test.ok(!session);
	test.ok(!facebook.getSignedRequest());

	// test an actual http signed request
	var options = {
		path: '/?' + querystring.stringify({ signed_request: NON_TOSSED_SIGNED_REQUEST })
	};
	httpServerTest(options, function(request, response) {
		facebook.request = request;
		test.deepEqual(facebook.getSignedRequest(), {algorithm : 'HMAC-SHA256'});
		test.done();
	});
};

// TODO: is it possible or necessary to support this?
//  exports.testBundledCACert = function(test) {
//    var facebook = new fbsdk.Facebook({
//      appId  : APP_ID,
//      secret : SECRET,
//    });
//
//    // use the bundled cert from the start
//    Facebook::CURL_OPTS[CURLOPT_CAINFO] = dirname(__FILE__) . '/../src/fb_ca_chain_bundle.crt';
//    response = facebook.api('/naitik');
//
//    unset(Facebook::CURL_OPTS[CURLOPT_CAINFO]);
//    test.equal(
//      response.id, '5526183', 'should get expected id.');
//  }

// TODO: doc
function httpServerTest(options, test, result) {
	options.host = 'localhost';
	options.port = port++;
	options.path = options.path || '/';

	// create a server to test an http request
	var server = http.createServer(function(request, response) {
		test(request, response);
		response.end();
		server.close();
	});
	server.listen(options.port, function() {
		http.request(options, result).end();
	});
}
var port = 8889;

function clone(object) {
	var new_object = {};
	for (var i in object) {
		new_object[i] = object[i];
	}
	return new_object;
}