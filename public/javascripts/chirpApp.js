

var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($http, $rootScope) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})
		//chat
		.when('/mensajes', {
			templateUrl: 'chat.html',
			controller: 'chatController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});

app.controller('chatController', function(postService, $scope, $rootScope){
	//$scope.posts = postService.query();
	//$scope.newPost = {created_by: '', text: '', created_at: ''};
	$scope.usuario = {
		mensaje:"",
		nombre:$rootScope.current_user
	}
	$scope.chats = []
	$scope.socket = io.connect('http://localhost:3000');
	$scope.socket.on('chat', function(data){
		var output = document.getElementById('output'),
	    feedback = document.getElementById('feedback');
		console.log('mensaje se mando')
		feedback.innerHTML = '';
		output.innerHTML += '<p><strong>' + data.baslik + ': </strong>' + data.mesaj + '</p>';
	});
	
	$scope.enviar = function() {
		//$scope.usuario.mensaje = Date.now();
		$scope.socket.emit('chat', {
			mesaj: $scope.usuario.mensaje,
			baslik: $scope.usuario.nombre
		});
		$scope.usuario.mensaje = "";
	};
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
});

function verifyCaptcha() {
	document.getElementById('g-recaptcha-error').innerHTML = '';
}

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
  $scope.submitUserForm = function () {
	var response = grecaptcha.getResponse();
	if(response.length == 0) {
		document.getElementById('g-recaptcha-error').innerHTML = '<span style="color:red;">This field is required.</span>';
		return false;
	}
	return true;
	}
 
	$scope.verifyCaptcha = function () {
		document.getElementById('g-recaptcha-error').innerHTML = '';
	}
  $scope.register = function(){
	if(!this.submitUserForm()){
		return;
	}
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});


/* 
app.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(true);
}]);
 */