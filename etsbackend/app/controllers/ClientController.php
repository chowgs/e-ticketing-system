<?php
declare(strict_types=1);

class ClientController extends \Phalcon\Mvc\Controller
{
    public function getDivisionsAction()
    {
        $this->view->disable(); 

        // Fetch divisions from the database
        $divisions = Divisions::find(); 

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
        $office_id = (int)$rawData['office_id'];
        $issue_request = $this->filter->sanitize($rawData['issue_request'], 'string');
        $division_id = (int)$rawData['division_id'];
    
        // Determine the target table based on division_id
        $targetTable = null;
        switch ($division_id) {
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
        $targetTable->issue_request = $issue_request;
        $targetTable->personnel_id = null;
        $targetTable->division_id = $division_id;
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
    
        if (count($reports) > 0) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $reports->toArray()
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No reports found.'
            ]);
        }
    }   

    // save signature to itrm_service_report
    public function saveSignatureAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        $reportId = $this->filter->sanitize($rawData['reportId'], 'int');
        $signature = $rawData['signature']; // Base64 encoded signature
    
        // Fetch the report
        $report = ItrmServiceReport::findFirstById($reportId);
    
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Report not found.'
            ]);
        }
    
        // Save the signature
        $report->signature = $signature;
    
        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Signature saved successfully.'
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Failed to save signature.',
                'errors' => $report->getMessages()
            ]);
        }
    }
    
    
}

