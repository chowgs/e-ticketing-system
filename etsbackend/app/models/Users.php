<?php

class Users extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id_number;

    /**
     *
     * @var string
     */
    public $name;

    /**
     *
     * @var string
     */
    public $password;

    /**
     *
     * @var integer
     */
    public $office_id;

    /**
     *
     * @var integer
     */
    public $division_id;

    /**
     *
     * @var string
     */
    public $designation;

    /**
     *
     * @var string
     */
    public $permissions;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("users");
        $this->hasMany('id_number', 'ItrmServiceReport', 'personnel_id', ['alias' => 'ItrmServiceReport']);
        $this->belongsTo('division_id', '\Divisions', 'division_id', ['alias' => 'Divisions']);
        $this->belongsTo('office_id', '\Office', 'office_id', ['alias' => 'Office']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return Users[]|Users|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return Users|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
