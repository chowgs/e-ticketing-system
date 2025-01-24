<?php

class Office extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $office_id;

    /**
     *
     * @var string
     */
    public $office_name;

    /**
     *
     * @var string
     */
    public $office_value;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("office");
        $this->hasMany('office_id', 'ItrmServiceReport', 'office_id', ['alias' => 'ItrmServiceReport']);
        $this->hasMany('office_id', 'ServiceReports', 'office_id', ['alias' => 'ServiceReports']);
        $this->hasMany('office_id', 'Users', 'office_id', ['alias' => 'Users']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return Office[]|Office|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return Office|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
