'use strict';

var app = angular.module('codeplus', [
			'ui.bootstrap',
			'ui.router',
			'ngResource', 
			'ngRoute',
			'ngCookies',
			'angular-md5'
		]
	)

app.constant('AUTH_EVENTS', {
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
	user: 'USER',
	admin: 'ADMIN'
})

app.config(function ($routeProvider, $httpProvider, $locationProvider, $stateProvider, $cookiesProvider, USER_ROLES) {
	    $routeProvider
	    	.when('/admin/home/main', {templateUrl: 'template/main.html'})
	    	.when('/admin/home/orcamento', {templateUrl: 'template/blank.html'})
	    	.when('/admin/catalogo/categoria', {templateUrl: 'template/blank.html'})
	    	.when('/admin/catalogo/produto', {templateUrl: 'template/blank.html'})
	    	.when('/admin/catalogo/item', {templateUrl: 'template/blank.html'})
	    	.when('/admin/catalogo/atributo', {templateUrl: 'template/blank.html'})
	    	.when('/admin/usuario/adduser', {templateUrl: 'template/blank.html'})
	    	.when('/admin/usuario/deluser', {templateUrl: 'template/blank.html'})
	    	.when('/admin/usuario/addgroup', {templateUrl: 'template/blank.html'})
	    	.otherwise('/admin/home/main')
	    	;

	    $locationProvider.html5Mode(true).hashPrefix('!');
	    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	    $httpProvider.defaults.useXDomain = true;

		$httpProvider.interceptors.push(['$injector',
			function ($injector) {
				return $injector.get('AuthInterceptor');
			}
		]);

	  	$stateProvider
		    .state('admin', {
				url: '/admin',
				abstract: true,
				resolve: {
					auth: function resolveAuthentication(AuthResolver) { 
						return AuthResolver.resolve();
					}
				}
		    })
		    .state('admin.home', {
				url: '/home',
				abstract: true,
				data: {
					authorizedRoles: []
				}
		    })
		    .state('admin.home.main', {
				url: '/main'
		    })
		    .state('admin.home.orcamento', {
				url: '/orcamento'
		    })
		    .state('admin.catalogo', {
				url: '/catalogo',
				abstract: true,
				data: {
					authorizedRoles: [USER_ROLES.user]
				},
		    })
		    .state('admin.catalogo.categoria', {
				url: '/categoria'
		    })
		    .state('admin.catalogo.produto', {
				url: '/produto'
		    })
		    .state('admin.catalogo.item', {
				url: '/item'
		    })
		    .state('admin.catalogo.atributo', {
				url: '/atributo'
		    })
		    .state('admin.usuario', {
				url: '/usuario',
				abstract: true,
				data: {
					authorizedRoles: [USER_ROLES.admin]
				},
		    })
		    .state('admin.usuario.adduser', {
				url: '/adduser'
		    })
		    .state('admin.usuario.deluser', {
				url: '/deluser'
		    })
		    .state('admin.usuario.addgroup', {
				url: '/addgroup'
		    })
		;

		var n = new Date();
		$cookiesProvider.defaults.path = '/';
		$cookiesProvider.defaults.domain = location.hostname;
		$cookiesProvider.defaults.secure = false;
		$cookiesProvider.defaults.expires = new Date(n.getFullYear()+1, n.getMonth(), n.getDate());

	}
);

app.run(function ($rootScope, AUTH_EVENTS, LoginService) {
	$rootScope.currentUser = {};
	LoginService.loadLogged().then(function (user) {
		if (user !== undefined) {
			$rootScope.currentUser = user;
		}
		$rootScope.$on('$stateChangeStart', function (event, next) {
			var authorizedRoles = next.data.authorizedRoles;
			if (!LoginService.isAuthorized(authorizedRoles)) {
				event.preventDefault();
				if (LoginService.isAuthenticated()) {
					$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
				} else {
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
				}
			}
		});

		$rootScope.$on('$viewContentLoaded', function(event, viewConfig) { 
        });

	});
})

app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, Session) {
	return {
		request: function(config) {
			var token = Session.getToken();
			console.log("loaded token: ", token);
			if (token !== undefined) {
				config.headers['x-auth-token'] = token;
			}
			return config;
		},

		responseError: function (response) { 
			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
				403: AUTH_EVENTS.notAuthorized,
				419: AUTH_EVENTS.sessionTimeout,
				440: AUTH_EVENTS.sessionTimeout
			}[response.status], response);
			return $q.reject(response);
		}
	};
});

app.factory('AuthResolver', function ($q, $rootScope, $state) {
	return {
		resolve: function () {
			var deferred = $q.defer();
			var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
				if (angular.isDefined(currentUser)) {
					if (currentUser) {
						deferred.resolve(currentUser);
					} else {
						deferred.reject();
						$state.go('login');
					}
					unwatch();
				}
			});
			return deferred.promise;
		}
	};
});