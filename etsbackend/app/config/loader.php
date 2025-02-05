<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerDirs([
        $config->application->controllersDir,
        $config->application->modelsDir,
        $config->application->tcpdfDir,       // Register TCPDF Library to Loader
        ]);

    $loader->registerFiles([
        $config->application->tcpdfDir.'tcpdf.php',
        $config->application->tcpdfDir.'examples/barcodes/tcpdf_barcodes_1d_include.php',
        $config->application->tcpdfDir.'examples/barcodes/tcpdf_barcodes_2d_include.php',
    ]);
    
    $loader->register();
    
