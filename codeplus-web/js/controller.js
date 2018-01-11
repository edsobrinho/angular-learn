'use strict';

var app = angular.module('codeplus');

app.controller('ApplicationController', function ($scope, USER_ROLES, AUTH_EVENTS, LoginService, Session) {
	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = LoginService.isAuthorized;
	
	$scope.isAuthenticated = LoginService.isAuthenticated;

	$scope.setCurrentUser = function (user) {
		$scope.currentUser = user;
	};

	$scope.logout = function() {
		LoginService.logout();
	}

	$scope.$on(AUTH_EVENTS.notAuthorized, function(obj) {
		console.log("Não autorizado: ", obj);
	});

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(obj) {
		console.log("Não autenticado: ", obj);
	});

	$scope.setIdioma = function(cdIdioma) {
		Session.setIdioma(cdIdioma);
	}

	$scope.isIdiomaActive = function(cdIdioma) {
		return Session.cdIdioma == cdIdioma;
	}
});

app.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, LoginService) {
	$scope.credentials = {
		username: '',
		password: ''
	};
	$scope.login = function (credentials) {
		LoginService.login(credentials).then(function (user) {
			$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$rootScope.currentUser = user;
			console.log("logou:", user);
		}, function (obj) {
			console.log("fail:", obj);
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});
	};

});

app.controller('NavbarController', function ($scope) {
	$scope.itens = [
		{
			title:'Home', 
			icon: 'fa-home', 
			subitens:[
				{title: 'Visão geral', icon: 'fa-sitemap', link: 'admin.home.main'},
				{title: 'Orçamentos recebidos', icon: 'fa-usd', link: 'admin.home.orcamento'}
			]
		},
		{
			title:'Catálogo', 
			icon: 'fa-cube', 
			subitens:[
				{title: 'Categorias', icon: 'fa-table', link: 'admin.catalogo.categoria'},
				{title: 'Produtos', icon: 'fa-cube', link: 'admin.catalogo.produto'},
				{title: 'Ítens', icon: 'fa-gear', link: 'admin.catalogo.item'},
				{title: 'Atributos', icon: 'fa-list-alt', link: 'admin.catalogo.atributo'}
			]
		},
		{
			title:'Usuários', 
			icon: 'fa-male', 
			subitens:[
				{title: 'Adicionar user', icon: 'fa-table', link: 'admin.usuario.adduser'},
				{title: 'Remover user', icon: 'fa-cube', link: 'admin.usuario.deluser'},
				{title: 'Adicionar grupo', icon: 'fa-gear', link: 'admin.usuario.addgroup'}
			]
		}
	];
})

