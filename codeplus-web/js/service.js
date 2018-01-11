'use strict';

var services = angular.module('codeplus');


services.factory('LoginService', 
    function ($http, $q, Session, md5) {
    	var loginService = {}

    	loginService.login = function (credentials) {
    		var md5pass = credentials.password != undefined ? md5.createHash(credentials.password) : "";
			return $http({
						method: 'POST',
    					url: '/rest/login',
    					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				 		transformRequest: function(obj) {
					        var str = [];
					        for(var p in obj)
					        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					        return str.join("&");
				    	},
    					data: {username: credentials.username, password: md5pass}
					})
					.then(function (res) {
						var usuario = res.data;
						Session.create(usuario);
						return usuario;
					}).catch(function(obc){
						console.log("ERRO login");
					});
		};

		loginService.logout = function () {
			return $http({
						method: 'GET',
    					url: '/rest/logout'
					})
					.then(function (res) {
						var usuario = res.data;
						Session.destroy();
						return usuario;
					}).catch(function(obc){
						console.log("ERRO logout");
					});
		}
		
		loginService.loadLogged = function() {
			return $http({
						method: 'GET',
    					url: '/rest/usuario/logged'
    				})
					.then(function (res) {
						var usuario = res.data.principal;
						if (usuario) {
							Session.create(usuario);
						}
						return usuario;
					}).catch(function(obc){
						console.log("ERRO loadLogged");
					});
		}

		loginService.isAuthenticated = function () {
			return !!Session.getToken();
		};

		loginService.isAuthorized = function (authorizedRoles) {
			var autorized = (loginService.isAuthenticated() && Session.checkRole(authorizedRoles));
			return autorized;
		};

		return loginService;
    }
);


services.service('Session', 
	function ($cookies) {
		var cookieKey = 'session';
		var container = {};

		var loadSession = function() {
			if(container.id == undefined) {
				var tmp = $cookies.getObject(cookieKey);
				if (tmp != undefined) {
					angular.forEach(tmp, function(value, key) {
						container[key] = value;
					});
				}
			}
		}

		this.create = function (usuario) {
			container.id = usuario.token;
			container.cdEmpresa = usuario.cdEmpresa;
			container.cdUsuario = usuario.cdUsuario;
			container.userRole =  [];
			for (var i = 0, len = usuario.authorities.length; i < len; i++) {
				this.userRole.push(usuario.authorities[i].authority);
			}
			container.cdIdioma = 1;
			$cookies.putObject(cookieKey, this);

		};

		this.destroy = function () {
			container = {};
			container.cdIdioma = 1;
			$cookies.remove(cookieKey);
		};

		this.getToken = function() {
			if (container.id == undefined) {
				loadSession()
			}
			return container.id;
		}

		this.checkRole = function(roles) {
			if (!angular.isArray(roles)) {
				roles = [roles];
			}
			if (roles.length == 0) {
				return true;
			}
			if (this.userRole !== undefined) {
				for (var i = 0; i < roles.length; i ++) {
					if (this.userRole.indexOf(roles[i]) !== -1) {
						return true;
					}
				}
			}
			return false;
		}

		this.setIdioma = function(cdIdioma) {
			this.cdIdioma = cdIdioma;
		}
	}
);