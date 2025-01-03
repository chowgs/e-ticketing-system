<?php

class ItrmServiceReport extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $control_no;

    /**
     *
     * @var string
     */
    public $date_of_request;

    /**
     *
     * @var string
     */
    public $name;

    /**
     *
     * @var string
     */
    public $dept_head;

    /**
     *
     * @var string
     */
    public $contact_no;

    /**
     *
     * @var integer
     */
    public $office_id;

    /**
     *
     * @var string
     */
    public $issue_request;

    /**
     *
     * @var integer
     */
    public $personnel_id;

    /**
     *
     * @var integer
     */
    public $division_id;

    /**
     *
     * @var integer
     */
    public $approval_status;

    /**
     *
     * @var integer
     */
    public $accept;

    /**
     *
     * @var string
     */
    public $property_no;

    /**
     *
     * @var string
     */
    public $services;

    /**
     *
     * @var string
     */
    public $service_level_id;

    /**
     *
     * @var string
     */
    public $action_taken;

    /**
     *
     * @var string
     */
    public $remarks;

    /**
     *
     * @var string
     */
    public $date_started;

    /**
     *
     * @var string
     */
    public $datetime_accomplished;

    /**
     *
     * @var string
     */
    public $date_released;

    /**
     *
     * @var integer
     */
    public $released;

    /**
     *
     * @var string
     */
    public $released_to;

    /**
     *
     * @var string
     */
    public $signature;

    /**
     *
     * @var string
     */
    public $request_status;

    /**
     *
     * @var string
     */
    public $task_duration;

    /**
     *
     * @var integer
     */
    public $units;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("itrm_service_report");
        $this->belongsTo('division_id', '\Divisions', 'division_id', ['alias' => 'Divisions']);
        $this->belongsTo('office_id', '\Office', 'office_id', ['alias' => 'Office']);
        $this->belongsTo('personnel_id', '\Users', 'id_number', ['alias' => 'Users']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return ItrmServiceReport[]|ItrmServiceReport|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return ItrmServiceReport|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
