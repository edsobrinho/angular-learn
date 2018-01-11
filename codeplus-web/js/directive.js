'use strict';

var directives = angular.module('codeplus');


directives.directive('loginDialog', function (AUTH_EVENTS) {
	return {
		restrict: 'A',
		template: '<div ng-if="visible"  ng-include="\'template/login-form.html\'">',
		link: function (scope) {
			var showDialog = function () {
				scope.visible = true;
			};

			scope.visible = false;
			scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
			scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
		}
	};
});

directives.directive('customMenuItem', function ($timeout, $state) {
	return {
		restrict: 'E',
		replace: true,
		controller: 'NavbarController',
		templateUrl: 'template/menuitem.html',
		link: function (scope) {
			$timeout(initApp.leftNav, 0);
			
			scope.isActive = function(toState) {
				return toState == $state.current.name;
			}
		}
	};
});
