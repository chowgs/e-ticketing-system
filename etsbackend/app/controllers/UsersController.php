<?php
declare(strict_types=1);
use Phalcon\Http\Response;
use Phalcon\Filter\FilterFactory;

class UsersController extends \Phalcon\Mvc\Controller
{
    public function loginAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
        
        $factory = new FilterFactory();
        $locator = $factory->newInstance();
    
        // Sanitize input
        $id_number = $locator->sanitize($rawData['id_number'], ['int']);
        $password = $locator->sanitize($rawData['password'], ['string']);
    
        // Error message for generic failure
        $response_array = ['status' => 'fail', 'message' => 'Invalid credentials.'];
    
        // Check if user exists
        $user = Users::findFirstByIdNumber($id_number);
    
        if ($user && $this->security->checkHash($password, $user->password)) {
            // Generate a secure session token
            $sessionToken = bin2hex(random_bytes(32));
    
            // Store session details
            $this->session->set('auth', [
                'token' => $sessionToken,
                'id' => $user->id_number,
                'name' => $user->name,
                'permissions' => json_decode($user->permissions), 
                'division_id' => $user->division_id,
                'office_id' => $user->office_id, 
            ]);
    
            $response_array = [
                'status' => 'success',
                'message' => 'Login successful.',
                'token' => $sessionToken,
                'permissions' => $this->session->get('auth')['permissions'], // Send permissions to frontend
            ];
        }
    
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    public function logoutAction()
    {
        $this->view->disable();
    
        // Destroy the session
        $this->session->destroy();
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'message' => 'Logged out successfully.'
        ]);
    }
        
    // get use information
    public function getUserInfoAction()
    {
        $this->view->disable();
        
        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');
    
        if (isset($auth['id'])) {
            $id_number = $auth['id'];
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User ID not found in session.'
            ])->send();
        }
    
        // Find the user by ID number
        $user = Users::findFirstByIdNumber($id_number);
    
        if ($user) {
            $office = Office::findFirst($user->office_id);
            $division = Divisions::findFirst($user->division_id);
            $permissions = json_decode($user->permissions, true);
    
            $response_array = [
                'status' => 'success',
                'data' => [
                    'id_number' => $user->id_number,
                    'name' => $user->name,
                    'designation' => $user->designation,
                    'office_id' => $office ? $office->office_id : null,
                    'office_name' => $office ? $office->office_name : null,
                    'division_id' => $division ? $division->division_id : null,
                    'division_name' => $division ? $division->division_name : null,
                    'permissions' => $permissions
                ]
            ];
        } else {
            $response_array = [
                'status' => 'fail',
                'message' => 'User not found'
            ];
        }
    
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    // change password 
    public function changePasswordAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
        
        $factory = new FilterFactory();
        $locator = $factory->newInstance();
        
        $response_array = array();
    
        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');
        $id_number = $auth['id'];
    
        // Retrieve and sanitize the input
        $current_password = $locator->sanitize($rawData['current_password'], ['striptags', 'string']);
        $new_password = $locator->sanitize($rawData['new_password'], ['striptags', 'string']);
    
        // Find the user
        $user = Users::findFirstByIdNumber($id_number);
    
        if ($user) {
            // Verify the current password
            if ($this->security->checkHash($current_password, $user->password)) {
                // Update the password
                $user->password = $this->security->hash($new_password);
                if ($user->save()) {
                    $response_array = [
                        'status' => 'success',
                        'message' => 'Password changed successfully.'
                    ];
                } else {
                    $response_array = [
                        'status' => 'fail',
                        'message' => 'Failed to update password.'
                    ];
                }
            } else {
                $response_array = [
                    'status' => 'fail',
                    'message' => 'Current password is incorrect.'
                ];
            }
        } else {
            $response_array = [
                'status' => 'fail',
                'message' => 'User not found.'
            ];
        }
    
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    // update logged in user's info 
    public function updateUserInfoAction()
    {
        $this->view->disable();
    
        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');
    
        if (!isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User ID not found in session.'
            ])->send();
        }
    
        $id_number = $auth['id'];
    
        // Find the user by ID number
        $user = Users::findFirstByIdNumber($id_number);
    
        if (!$user) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not found.'
            ])->send();
        }
    
        // Get data from the request
        $data = $this->request->getJsonRawBody();
    
        if (isset($data->name)) $user->name = $data->name;
        if (isset($data->designation)) $user->designation = $data->designation;

        if (isset($data->office)) {
            $office = Office::findFirst($data->office);  // Fetch the office by ID
            $user->office_id = $office ? $office->office_id : null;
        }
        if (isset($data->division)) {
            $division = Divisions::findFirst($data->division);  // Fetch the division by ID
            $user->division_id = $division ? $division->division_id : null;
        }
    
        // Save the changes
        if ($user->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'User updated successfully.'
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Failed to update user.',
                'errors' => $user->getMessages()
            ])->send();
        }
    }

    // fetch logged in user's permissions for edit
    public function getUserPermissionsAction()
    {
        $this->view->disable();
    
        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');
    
        if (!isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User ID not found in session.'
            ])->send();
        }
    
        $id_number = $auth['id'];
    
        // Find the user
        $user = Users::findFirstByIdNumber($id_number);
    
        if (!$user) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not found.'
            ])->send();
        }
    
        $permissions = json_decode($user->permissions); // permissions are stored as JSON
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'permissions' => $permissions
        ])->send();
    }

    public function getUserPermissionsByIdAction($userId)
    {
        $this->view->disable();
    
        // Find the user by the provided userId
        $user = Users::findFirstByIdNumber($userId);
    
        if (!$user) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not found.'
            ])->send();
        }
    
        $permissions = json_decode($user->permissions); // permissions are stored as JSON
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'permissions' => $permissions
        ])->send();
    } 

    // update logged in user's permissions 
    public function updateUserPermissionsAction()
    {
        $this->view->disable();
    
        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');
    
        if (!isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User ID not found in session.'
            ])->send();
        }
    
        $id_number = $auth['id'];
    
        // Find the user
        $user = Users::findFirstByIdNumber($id_number);
    
        if (!$user) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not found.'
            ])->send();
        }
    
        // Get the updated permissions from the request
        $data = $this->request->getJsonRawBody();
    
        if (!isset($data->permissions)) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Permissions data is required.'
            ])->send();
        }
    
        $user->permissions = json_encode($data->permissions);
    
        if ($user->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Permissions updated successfully.'
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Failed to update permissions.',
                'errors' => $user->getMessages()
            ])->send();
        }
    }    

    // add new user to table 'users'
    public function registerAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        // Sanitize and fetch data
        $factory = new FilterFactory();
        $locator = $factory->newInstance();
    
        $id_number = $locator->sanitize($rawData['id_number'], ['int']);
        $name = $locator->sanitize($rawData['name'], ['striptags', 'string']);
        $password = $locator->sanitize($rawData['password'], ['striptags', 'string']);
        $designation = $locator->sanitize($rawData['designation'], ['striptags', 'string']);
        $division_id = $locator->sanitize($rawData['division'], ['int']);
        $office_id = $locator->sanitize($rawData['office'], ['int']);
        $permissions = $rawData['permissions']; // JSON string
    
        $user = new Users();
        $user->id_number = $id_number;
        $user->name = $name;
        $user->password = $this->security->hash($password);
        $user->designation = $designation;
        $user->division_id = $division_id;
        $user->office_id = $office_id;
        $user->permissions = $permissions;
    
        if ($user->save()) {
            $this->response->setJsonContent(['status' => 'success']);
        } else {
            $this->response->setJsonContent(['status' => 'fail', 'messages' => $user->getMessages()]);
        }
        return $this->response->send();
    }

    // option to add user to personnels table 
    public function savePersonnelAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody();

        $personnel = new Personnels();
        $personnel->personnel_id = $data->personnel_id;
        $personnel->personnel_name = $data->personnel_name;
        $personnel->division_id = $data->division_id;
        $personnel->division_name = $data->division_name;

        if ($personnel->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Personnel saved successfully.'
            ]);
        }

        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'Failed to save personnel.',
            'errors' => $personnel->getMessages() // This will provide more details about the failure
        ]);
    }

    // fetch and display all users
    public function getUsersAction()
    {
        $this->view->disable();
        
        // Fetch users along with office and division details
        $users = Users::find([
            'columns' => 'id_number, name, designation, office_id, division_id',
        ]);
    
        // Initialize an array to hold the transformed user data
        $userData = [];
    
        if ($users) {
            // Loop through each user to replace office_id and division_id with their names/values
            foreach ($users as $user) {
                // Get office value by office_id
                $office = Office::findFirst($user->office_id);
                $division = Divisions::findFirst($user->division_id);
    
                // Add the user data along with office_value and division_name
                $userData[] = [
                    'id_number' => $user->id_number,
                    'name' => $user->name,
                    'designation' => $user->designation,
                    'office' => $office ? $office->office_value : '', // Fetch the office_value
                    'division' => $division ? $division->division_name : '', // Fetch the division_name
                ];
            }
    
            // Send the response with the transformed data
            $this->response->setJsonContent([
                'status' => 'success',
                'data' => $userData,
            ]);
        } else {
            $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No users found',
            ]);
        }
    
        return $this->response->send();
    }

    public function addOfficeAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        $factory = new FilterFactory();
        $locator = $factory->newInstance();
    
        $response_array = [
            'status' => 'fail',
            'message' => 'An unexpected error occurred.'
        ];
    
        if (isset($rawData['office_name']) && isset($rawData['office_value'])) {
            // Sanitize and convert to uppercase
            $office_name = strtoupper($locator->sanitize($rawData['office_name'], ['striptags', 'string']));
            $office_value = $locator->sanitize($rawData['office_value'], ['striptags', 'string']);
    
            // Check if office already exists
            $existingOffice = Office::findFirst([
                'conditions' => 'office_name = :office_name:',
                'bind'       => ['office_name' => $office_name]
            ]);
    
            if ($existingOffice) {
                $response_array['message'] = 'Office already exists.';
            } else {
                // Create and save new office
                $office = new Office();
                $office->office_name = $office_name;
                $office->office_value = $office_value;  // Add office_value
    
                if ($office->save() == false) {
                    $response_array['message'] = 'Office registration unsuccessful.';
                } else {
                    $response_array['status'] = 'success';
                    $response_array['message'] = 'Office added successfully.';
                }
            }
        } else {
            $response_array['message'] = 'Office name and value are required.';
        }
    
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    public function addDivisionAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);

        $factory = new FilterFactory();
        $locator = $factory->newInstance();

        $response_array = [
            'status' => 'fail',
            'message' => 'An unexpected error occurred.'
        ];

        if (isset($rawData['division_name'])) {
            // Sanitize and convert to uppercase
            $division_name = strtoupper($locator->sanitize($rawData['division_name'], ['striptags', 'string']));

            // Check if division already exists
            $existingDivision = Divisions::findFirst([
                'conditions' => 'division_name = :division_name:',
                'bind'       => ['division_name' => $division_name]
            ]);

            if ($existingDivision) {
                $response_array['message'] = 'Division already exists.';
            } else {
                // Create and save new division
                $division = new Divisions();
                $division->division_name = $division_name;

                if ($division->save() == false) {
                    $response_array['message'] = 'Division registration unsuccessful.';
                } else {
                    $response_array['status'] = 'success';
                    $response_array['message'] = 'Division added successfully.';
                }
            }
        } else {
            $response_array['message'] = 'Division name is required.';
        }

        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }
    

    // fetch and display all existing office 
    public function getAllOfficesAction()
    {
        $this->view->disable();
        $offices = Office::find();
        if ($offices) {
            $this->response->setJsonContent([
                'status' => 'success',
                'data' => $offices->toArray(),
            ]);
        } else {
            $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No office found',
            ]);
        }
    
        return $this->response->send();
    }  
      
    // fetch user perms for showing the appropriate tabs
    public function getUserPermsAction()
    {
        $this->view->disable();

        // Assume we have a way to get the logged-in user’s ID
        $userId = $this->session->get('auth')['id'];

        // Fetch user data
        $user = Users::findFirst($userId);

        if ($user) {
            $response = [
                'status' => 'success',
                'data' => [
                    'name' => $user->name,
                    'permissions' => $user->permissions
                ]
            ];
        } else {
            $response = [
                'status' => 'fail',
                'message' => 'User not found.'
            ];
        }

        $this->response->setJsonContent($response);
        return $this->response->send();
    }

    // fetch divisions 
    public function getDivisionsAction()
    {
        $this->view->disable();
    
        // Fetch all divisions
        $divisions = Divisions::find();
    
        // Format the divisions into an array of names and IDs
        $divisionArray = [];
        foreach ($divisions as $division) {
            $divisionArray[] = [
                'division_id' => $division->division_id,
                'division_name' => $division->division_name,
            ];
        }
    
        $this->response->setJsonContent([
            'status' => 'success',
            'data' => $divisionArray,
        ]);
        return $this->response->send();
    }

    // fetch office 
    public function getOfficeAction()
    {
        $this->view->disable();
    
        // Fetch all offices
        $offices = Office::find();
    
        // Format the offices into an array of names and IDs
        $officeArray = [];
        foreach ($offices as $office) {
            $officeArray[] = [
                'office_id' => $office->office_id,
                'office_name' => $office->office_name,
            ];
        }
    
        $this->response->setJsonContent([
            'status' => 'success',
            'data' => $officeArray,
        ]);
        return $this->response->send();
    }    

    public function updateOfficeAction()
    {
        $request = $this->request->getJsonRawBody();
        $officeId = $request->office_id ?? null;
        $officeName = $request->office_name ?? null;
        $officeVal = $request->office_value ?? null;
    
        if (!$officeId || !$officeName || !$officeVal) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Invalid input data',
            ]);
        }
    
        $office = Office::findFirst($officeId);
        if (!$office) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Office not found',
            ]);
        }
    
        $office->office_name = $officeName;
        $office->office_value = $officeVal;
        if ($office->save()) {
            return $this->response->setJsonContent(['status' => 'success']);
        }
    
        return $this->response->setJsonContent([
            'status' => 'error',
            'message' => 'Failed to update office',
            'errors' => $office->getMessages(),
        ]);
    }

    public function updateDivisionAction()
    {
        $request = $this->request->getJsonRawBody();
        $divisionId = $request->division_id ?? null;
        $divisionName = $request->division_name ?? null;
    
        // if (!$divisionId || !$divisionName) {
        if (!$divisionName) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Invalid input data',
            ]);
        }
    
        $division = Divisions::findFirst($divisionId);
        if (!$division) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Division not found',
            ]);
        }
    
        $division->division_name = $divisionName;
        if ($division->save()) {
            return $this->response->setJsonContent(['status' => 'success']);
        }
    
        return $this->response->setJsonContent([
            'status' => 'error',
            'message' => 'Failed to division office',
            'errors' => $division->getMessages(),
        ]);
    }

    // update selected user 
    public function updateUserAction()
    {
        // Fetch the raw body and decode it
        $requestData = json_decode($this->request->getRawBody());
    
        // Extract id_number, name, designation, and permissions from the decoded data
        $idNumber = $requestData->id_number ?? null;
        $name = $requestData->name ?? null;
        $designation = $requestData->designation ?? null;
        $permissions = $requestData->permissions ?? null; // Permissions will be included in the request
    
        // Validate the inputs
        if (!$idNumber || !$name || !$designation || !$permissions) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Invalid input data',
            ]);
        }
    
        // Find the user by id_number
        $user = Users::findFirst($idNumber);
        if (!$user) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'User not found',
            ]);
        }
    
        // Update the user's name, designation, and permissions if they have been modified
        if ($user->name !== $name) {
            $user->name = $name;
        }
        if ($user->designation !== $designation) {
            $user->designation = $designation;
        }
        if ($user->permissions !== json_encode($permissions)) {
            $user->permissions = json_encode($permissions); // Save the permissions as JSON
        }
    
        // Save the updated user data
        if ($user->save()) {
            return $this->response->setJsonContent([
                'status' => 'success'
            ]);
        }
    
        return $this->response->setJsonContent([
            'status' => 'error',
            'message' => 'Failed to update user',
            'errors' => $user->getMessages(),
        ]);
    }
    
    public function getJobRequestsAction()
    {
        $this->view->disable();
    
        $officeId = $this->session->get('auth')['office_id'];
    
        $filters = $this->request->getQuery('filters', null, []);
        $sort = $this->request->getQuery('sort', null, 'date_of_request'); // Default sort by date_of_request
        $order = $this->request->getQuery('order', null, 'ASC'); // Default order ASC
    
        $conditions = 'office_id = :office_id:';
        $bind = ['office_id' => $officeId];
    
        if (!empty($filters['name'])) {
            $conditions .= ' AND name LIKE :name:';
            $bind['name'] = '%' . $filters['name'] . '%';
        }
    
        $itrmReports = ItrmServiceReport::find([
            'conditions' => $conditions,
            'bind' => $bind,
            'order' => $sort . ' ' . $order,
        ]);
    
        $this->response->setJsonContent(['status' => 'success', 'data' => $itrmReports->toArray()]);
        return $this->response->send();
    }
        
    // update the approval_status on table itrm_service_report to "1"
    public function updateApprovalStatusAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        $id = (int) $rawData['id'];
        $approvalStatus = (int) $rawData['approval_status'];
    
        $report = ItrmServiceReport::findFirstById($id); 
        if ($report) {
            $report->approval_status = $approvalStatus;
            if ($approvalStatus === 1) { // Only set approval_datetime if the status is 1 (approved)
                $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
                $report->approval_datetime = $currentDateTime->format('Y-m-d H:i:s');
                $report->control_no = "Pending";

            }    
            if ($report->save()) {
                return $this->response->setJsonContent(['status' => 'success']);
            }
        }
        return $this->response->setJsonContent(['status' => 'fail', 'message' => 'Update failed.']);
    }
        
    // fetch approved reports from table itrm_service_report and display to it supervisor 
    public function getApprovedReportsAction()
    {
        $this->view->disable();
    
        // Fetch records with approval_status = 1 and join the office table to get office_name
        $phql = "
            SELECT 
                r.id,
                r.control_no,
                r.name,
                r.contact_no,
                r.issue_request,
                r.date_of_request,
                r.accept,
                o.office_name
            FROM 
                ItrmServiceReport AS r
            JOIN 
                Office AS o
            ON 
                r.office_id = o.office_id
            WHERE 
                r.approval_status = :status:
        ";
    
        $approvedReports = $this->modelsManager->executeQuery($phql, [
            'status' => 1
        ]);
    
        if (count($approvedReports) > 0) {
            $formattedReports = [];
            foreach ($approvedReports as $report) {
                $dateOfRequest = $report->date_of_request;
    
                // Format the date if it exists
                $formattedDate = $dateOfRequest 
                    ? (new \DateTime($dateOfRequest))->format('M. d, Y h:i A') 
                    : null;
    
                $formattedReports[] = [
                    'id' => $report->id,
                    'control_no' => $report->control_no,
                    'name' => $report->name,
                    'contact_no' => $report->contact_no,
                    'office_name' => $report->office_name,
                    'issue_request' => $report->issue_request,
                    'date_of_request' => $formattedDate,
                    'accept' => $report->accept,
                ];
            }
    
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $formattedReports
            ]);
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No approved reports found.'
        ]);
    }
    
    // stores value to control_no and accept column in itrm_service_report 
    public function acceptJobRequestAction()
    {
        // Get the report data from the request
        $reportData = $this->request->getJsonRawBody();
    
        // Find the report by ID (or other unique identifier passed from the frontend)
        $itrmReport = ItrmServiceReport::findFirstById($reportData->id);
    
        if (!$itrmReport) {
            // If the report does not exist, return an error response
            $response = [
                'status' => 'fail',
                'message' => 'Report not found.'
            ];
            $this->response->setJsonContent($response);
            return $this->response->send();
        }
    
        // Generate a unique control number based on the current year and count
        $currentYear = date('Y');
        $latestReport = ItrmServiceReport::findFirst([
            'conditions' => 'control_no LIKE :year:',
            'bind' => ['year' => "ITRM-$currentYear-%"],
            'order' => 'control_no DESC'
        ]);
    
        // Generate new control number
        if ($latestReport && $latestReport->control_no) {
            $lastNumber = (int) substr($latestReport->control_no, -4); // Get last 4 digits
            $newNumber = str_pad((string)($lastNumber + 1), 4, '0', STR_PAD_LEFT);  // Increment and pad
        } else {
            $newNumber = '0000';
        }
    
        // Update the control_no and other fields in the existing report
        $itrmReport->control_no = "ITRM-$currentYear-$newNumber";
        $itrmReport->services = $reportData->services ?? $itrmReport->services; // Optional: Update only if provided
        $itrmReport->action_taken = $reportData->action_taken ?? $itrmReport->action_taken;
        $itrmReport->datetime_started = $reportData->datetime_started ?? $itrmReport->datetime_started;
        $itrmReport->datetime_accomplished = $reportData->datetime_accomplished ?? $itrmReport->datetime_accomplished;
        $itrmReport->date_released = $reportData->date_released ?? $itrmReport->date_released;
        $itrmReport->released = $reportData->released ?? $itrmReport->released;
        // Set the 'accept' column to 1 (accepted) when the report is accepted
        $itrmReport->accept = 1;
        
        // Save the changes to the database
        if ($itrmReport->save()) {
            $response = [
                'status' => 'success',
                'message' => 'Job request updated successfully.',
                'data' => $itrmReport
            ];
        } else {
            $response = ['status' => 'fail', 'message' => 'Failed to update job request.'];
        }
    
        $this->response->setJsonContent($response);
        return $this->response->send();
    }

    // fetch reports with column accept value of "1" from itrm_service_report to monitor 
    public function fetchAcceptedReportsAction()
    {
        $phql = "
            SELECT 
                r.control_no,
                r.name,
                r.issue_request,
                r.date_of_request,
                o.office_name,
                r.personnel_id
            FROM 
                ItrmServiceReport AS r
            JOIN 
                Office AS o
            ON 
                r.office_id = o.office_id
            WHERE 
                r.accept = 1
        ";
    
        $reports = $this->modelsManager->executeQuery($phql);
    
        if (count($reports) > 0) {
            $formattedReports = [];
            foreach ($reports as $report) {
                $formattedReports[] = [
                    'control_no' => $report->control_no,
                    'name' => $report->name,
                    'issue_request' => $report->issue_request,
                    'date_of_request' => $report->date_of_request,
                    'office_name' => $report->office_name, 
                    'personnel_id' => $report->personnel_id
                ];
            }
    
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $formattedReports
            ]);
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No accepted reports found.'
        ]);
    }

    // personnel dropdown for monitor
    public function getPersonnelByDivisionAction()
    {
        $this->view->disable();
    
        // Retrieve logged-in user's division_id from session
        $divisionId = $this->session->get('auth')['division_id'];
    
        // Fetch personnel_id and personnel_name with the same division_id
        $personnel = Personnels::find([
            'conditions' => 'division_id = :division_id:',
            'bind'       => ['division_id' => $divisionId],
            'columns'    => 'personnel_id, personnel_name' // Specify columns
        ]);
    
        // Check if personnel data was found and return as JSON
        if (count($personnel) > 0) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $personnel->toArray()
            ])->send();
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No personnel found for this division.'
        ])->send();
    }
    
    // fetch the personnel id based on the selected dropdown 
    public function assignPersonnelToReportAction()
    {
        $this->view->disable();
    
        // Get JSON data from the request
        $data = $this->request->getJsonRawBody();
    
        if (!isset($data->control_no)) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'control_no is missing in the request.'
            ])->send();
        }
    
        $controlNo = $data->control_no;
        $personnelId = $data->personnel_id;
    
        // Log control_no to verify it is being sent correctly
        error_log("Control No received: " . $controlNo);
    
        // Retrieve the logged-in user's division_id from the session
        $divisionId = $this->session->get('auth')['division_id'];
    
        // Determine the appropriate model based on division_id
        $modelClass = null;
        if ($divisionId == 1) {
            $modelClass = 'ItrmServiceReport';
        } elseif ($divisionId == 2) {
            $modelClass = 'SysdevServiceReport';
        } elseif ($divisionId == 3) {
            $modelClass = 'CwServiceReport';
        }
    
        if (!$modelClass) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Invalid division for this user.'
            ])->send();
        }
    
        // Find the report by control_no
        $report = $modelClass::findFirst([
            'conditions' => 'control_no = :control_no:',
            'bind' => ['control_no' => $controlNo]
        ]);
    
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => "Service report with control_no '{$controlNo}' not found in '{$modelClass}'."
            ])->send();
        }
    
        // Assign the personnel_id
        $report->personnel_id = $personnelId;
    
        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Personnel assigned successfully.'
            ])->send();
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'Failed to assign personnel.'
        ])->send();
    }

    // fetch data job request for current user
    public function fetchReportsForCurrentUserAction()
    {
        $this->view->disable();
    
        // Get the currently logged-in user's id_number
        $auth = $this->session->get('auth');
        if (!$auth) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not authenticated.'
            ])->send();
        }
    
        $id_number = $auth['id'];
        
    
        // Fetch data from the tables based on personnel_id
        $reports = [];
    
        // Check in itrm_service_report
        $itrmReports = ItrmServiceReport::find([
            'conditions' => 'personnel_id = :id_number:',
            'bind'       => ['id_number' => $id_number]
        ]);
        if ($itrmReports) {
            $reports = array_merge($reports, $itrmReports->toArray());
        }
    
        // // Check in sysdev_service_report
        // $sysdevReports = SysdevServiceReport::find([
        //     'conditions' => 'personnel_id = :id_number:',
        //     'bind'       => ['id_number' => $id_number]
        // ]);
        // if ($sysdevReports) {
        //     $reports = array_merge($reports, $sysdevReports->toArray());
        // }
    
        // // Check in cw_service_report
        // $cwReports = CwServiceReport::find([
        //     'conditions' => 'personnel_id = :id_number:',
        //     'bind'       => ['id_number' => $id_number]
        // ]);
        // if ($cwReports) {
        //     $reports = array_merge($reports, $cwReports->toArray());
        // }
    
        // Return response
        if (!empty($reports)) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $reports
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No reports found for the current user.'
            ])->send();
        }
    }

    // fetch all offices but I only used it on displaying the office_name instead of office_id on view on task page. 
    public function fetchAllOfficesAction()
    {
        $this->view->disable();
    
        $offices = Office::find();
        if ($offices) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $offices->toArray()
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No offices found.'
            ])->send();
        }
    }

    // function for editing the task in task technical staff 
    public function updateItrmServiceReportAction($control_no)
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody();
    
        // Find the report by control number
        $report = ItrmServiceReport::findFirstByControlNo($control_no);
        if (!$report) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Report not found']);
        }
    
        // Dynamically update fields if they exist in the request payload
        $updatableFields = [
            'services', 'service_level_id', 'service_quantity_id', 'action_taken', 
            'remarks', 'date_started', 'datetime_accomplished', 
            'request_status', 'task_duration'
        ];
    
        foreach ($updatableFields as $field) {
            if (property_exists($data, $field)) {
                $value = $data->$field;
                if ($field === 'datetime_accomplished' || $field === 'date_started') {
                    $value = $value ? date('Y-m-d H:i:s', strtotime($value)) : null;
                } elseif ($field === 'services' || $field === 'service_level_id' || $field === 'service_quantity_id') {
                    $value = json_encode($value);
                }
                $report->$field = $value;
            }
        }
    
        $report->request_status = 'For Release';
    
        // Save the report
        if ($report->save()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Report updated successfully']);
        } else {
            $messages = [];
            foreach ($report->getMessages() as $message) {
                $messages[] = $message->getMessage();
            }
            return $this->response->setJsonContent(['status' => 'error', 'message' => implode(', ', $messages)]);
        }
    }
    
    // function for updating the request status and date released and released
    public function updateItrmServiceReportRequestStatusAction($control_no)
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody();
    
        // Find the report by control number
        $report = ItrmServiceReport::findFirstByControlNo($control_no);
        if (!$report) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Report not found']);
        }
    
        // Dynamically update fields if they exist in the request payload
        $updatableFields = [
            'date_released', 'released', 'request_status',
            'released_to'
        ];
    
        foreach ($updatableFields as $field) {
            if (property_exists($data, $field)) {
                $value = $data->$field;
                if (in_array($field, ['date_started', 'datetime_accomplished', 'date_released'])) {
                    $value = $value ? date('Y-m-d', strtotime($value)) : null;
                }
                $report->$field = $field === 'services' || $field === 'service_level_id' ? json_encode($value) : $value;
            }
        }
    
        $report->request_status = 'Released';
    
        // Save the report
        if ($report->save()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Report updated successfully']);
        } else {
            $messages = [];
            foreach ($report->getMessages() as $message) {
                $messages[] = $message->getMessage();
            }
            return $this->response->setJsonContent(['status' => 'error', 'message' => implode(', ', $messages)]);
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

