<?php
declare(strict_types=1);

class ClientController extends \Phalcon\Mvc\Controller
{

    public function getRequestDivisionAction()
    {
        $this->view->disable(); 

        // Fetch divisions from the database
        $requestDivisions = RequestDivision::find(); 

        if ($requestDivisions) {
            $response = [
                'status' => 'success',
                'data' => $requestDivisions->toArray() 
            ];
        } else {
            $response = [
                'status' => 'fail',
                'message' => 'No divisions found.'
            ];
        }

        // Send JSON response
        $this->response->setJsonContent($response);
        return $this->response->send();
    }

    public function getOfficesAction()
    {
        $this->view->disable();
    
        $offices = Office::find();
        $officeData = [];
    
        foreach ($offices as $office) {
            $officeData[] = [
                'office_id' => $office->office_id,
                'office_name' => $office->office_name
            ];
        }
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $officeData
        ]);
    }

    public function getDivisionsAction()
    {
        $this->view->disable(); 

        // Fetch divisions from the database
        $divisions = Divisions::find(); 

        $divisionData = [];
    
        foreach ($divisions as $division) {
            $divisionData[] = [
                'division_id' => $division->division_id,
                'division_name' => $division->division_name
            ];
        }
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $divisionData
        ]);

        if ($divisions) {
            $response = [
                'status' => 'success',
                'data' => $divisions->toArray() 
            ];
        } else {
            $response = [
                'status' => 'fail',
                'message' => 'No divisions found.'
            ];
        }

        // Send JSON response
        $this->response->setJsonContent($response);
        return $this->response->send();
    }

    // submit job request to office supervisor 
    public function createServiceReportAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        // Sanitize and retrieve inputs
        $name = $this->filter->sanitize($rawData['name'], 'string');
        $property_no = $this->filter->sanitize($rawData['property_no'], 'string');
        $contact = $this->filter->sanitize($rawData['contact'], 'string');
        $dept_head = $this->filter->sanitize($rawData['dept_head'], 'string');
        $requestDiv_Id = (int)$rawData['requestDiv_Id'];
        $office_id = (int)$rawData['office_id'];
        $division_id = (int)$rawData['division_id'];
        $issue_request = $this->filter->sanitize($rawData['issue_request'], 'string');


    
        // Determine the target table based on division_id
        $targetTable = null;
        // switch ($division_id) {
        switch ($requestDiv_Id) {
            case 1:
                $targetTable = new ItrmServiceReport();
                break;
            // case 2:
            //     $targetTable = new SysdevServiceReport();
            //     break;
            // case 3:
            //     $targetTable = new CwServiceReport();
            //     break;
            default:
                $this->response->setJsonContent(['status' => 'fail', 'message' => 'Invalid division ID.']);
                return $this->response->send();
        }
    
        // Assign common fields to the target table
        $targetTable->name = $name;
        $targetTable->contact_no = $contact;
        $targetTable->dept_head = $dept_head;
        $targetTable->office_id = $office_id;
        $targetTable->division_id = $division_id;
        $targetTable->issue_request = $issue_request;
        $targetTable->personnel_id = null;
        $targetTable->requestDiv_Id = $requestDiv_Id;
        $targetTable->approval_status = 0; // Default to unapproved
        $targetTable->property_no = $property_no;
        $targetTable->date_of_request = null; // Default to empty
        $targetTable->dept_sign = null; // Default to empty
    
        // Save the data into the specific table
        if ($targetTable->save()) {
            $this->response->setJsonContent(['status' => 'success', 'message' => 'Service report created successfully.']);
        } else {
            $this->response->setJsonContent(['status' => 'fail', 'message' => 'Failed to save service report.', 'errors' => $targetTable->getMessages()]);
        }
    
        return $this->response->send();
    }

    // display data based on search input value 
    public function getServiceReportAction()
    {
        $this->view->disable();
        $query = $this->request->getQuery('q', 'string');
    
        if (!$query) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Search query is required.'
            ]);
        }
    
        $reports = ItrmServiceReport::find([
            'conditions' => 'control_no LIKE :query: OR name LIKE :query:',
            'bind' => ['query' => '%' . $query . '%']
        ]);
    
        // Create a result set that includes the personnel_name instead of personnel_id
        $result = [];
        foreach ($reports as $report) {
            $personnelId = $report->personnel_id;
        
            // Get the user details from the 'users' table based on personnel_id
            $user = Users::findFirst([
                'conditions' => 'id_number = :personnel_id:',
                'bind' => ['personnel_id' => $personnelId]
            ]);
        
            // Append the report data with the name from the users table
            $reportData = $report->toArray();
            $reportData['personnel_name'] = $user ? $user->name : 'N/A';
        
            $result[] = $reportData;
        }

        if (count($result) > 0) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $result
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No reports found.'
            ]);
        }
    }  
}

