<?php
use Phalcon\Mvc\Router;

$router = new Router();
// $router = $di->getRouter();

$baseUri='/ets/etsbackend';

//login
$router->add($baseUri . '/login', [
    'controller' => 'users',
    'action'     => 'login',
]);

//add new user
$router->add($baseUri . '/register', [
    'controller' => 'users',
    'action'     => 'register',
]);

//fetch and display all users
$router->add($baseUri . '/users', [
    'controller' => 'users',
    'action' => 'getUsers',
]);

//get division for dropdown
$router->add($baseUri . '/divisions', [
    'controller' => 'client',
    'action'     => 'getDivisions'
]);

// create service report from client 
$router->add($baseUri . '/create', [
    'controller' => 'client',
    'action' => 'createServiceReport'
]);

// get service report by office id 
$router->add($baseUri . '/getServiceReportsByOfficeId', [
    'controller' => 'users',
    'action' => 'getServiceReportsByOfficeId'
]);


$router->add($baseUri . '/getAllOffices', [
    'controller' => 'users',
    'action' => 'getAllOffices',
]);


$router->handle($_SERVER['REQUEST_URI']);

