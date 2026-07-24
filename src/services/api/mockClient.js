import {
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse
} from './responseBuilder';

import {
  initialMockUsers,
  initialMockOrgUnits,
  initialMockRoles,
  initialMockPermissions,
  initialMockFeedback,
  initialMockAuditLogs,
  MOCK_TENANT_ID,
  MOCK_ORG_UNIT_ID
} from './mockData';

import { assessmentsData, careerDatabase, fallbackCareers } from '../../data/assessments';
import { deepClone, genId } from '../../utils/formatters';

// Persistent in-memory storage for mock REST server simulation
let usersStore = [...initialMockUsers];
let testsStore = deepClone(assessmentsData);
let feedbackStore = [...initialMockFeedback];
let auditLogsStore = [...initialMockAuditLogs];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockClient = {
  // GET request dispatcher
  get: async (url, config = {}) => {
    await delay(250);

    // 8.5 Get Logged-in User
    if (url === '/api/v1/auth/me') {
      const user = usersStore[0];
      return createSuccessResponse(user, "User profile fetched successfully");
    }

    // 9.2 Get User Consent History
    if (url.match(/\/api\/v1\/users\/[^/]+\/consents$/)) {
      const consentHistory = [
        {
          consentId: 'cns_001',
          userId: 'usr_student_001',
          consentType: 'GUARDIAN',
          consentGivenAt: '2026-07-01T10:00:00Z',
          status: 'ACTIVE'
        }
      ];
      return createSuccessResponse(consentHistory, "User consent history fetched successfully");
    }

    // 10.2 List Users
    if (url === '/api/v1/users') {
      return createPaginatedResponse(usersStore, 0, 20, usersStore.length, "Users fetched successfully");
    }

    // 10.3 Get User by ID
    if (url.match(/\/api\/v1\/users\/[^/]+$/)) {
      const parts = url.split('/');
      const userId = parts[parts.length - 1];
      const user = usersStore.find(u => u.id === userId || u.username === userId);
      if (user) {
        return createSuccessResponse(user, "User fetched successfully");
      }
      return createErrorResponse("RESOURCE_NOT_FOUND", "User not found", [], url);
    }

    // 11.1 List Roles
    if (url === '/api/v1/roles') {
      return createSuccessResponse(initialMockRoles, "Roles fetched successfully");
    }

    // 11.2 List Permissions
    if (url === '/api/v1/permissions') {
      return createSuccessResponse(initialMockPermissions, "Permissions fetched successfully");
    }

    // 12.2 List Organization Units
    if (url === '/api/v1/org-units') {
      return createPaginatedResponse(initialMockOrgUnits, 0, 20, initialMockOrgUnits.length, "Org units fetched successfully");
    }

    // 12.3 Get Organization Tree
    if (url === '/api/v1/org-units/tree') {
      const tree = {
        tenantId: MOCK_TENANT_ID,
        rootUnits: initialMockOrgUnits
      };
      return createSuccessResponse(tree, "Org tree fetched successfully");
    }

    // 14.2 List Configuration Groups
    if (url === '/api/v1/configuration-groups') {
      const groups = [
        { id: 'grp_001', tenantId: MOCK_TENANT_ID, code: 'GRADE', name: 'Student Grade', isSystemDefined: true }
      ];
      return createSuccessResponse(groups, "Configuration groups fetched successfully");
    }

    // 14.5 List Languages
    if (url === '/api/v1/languages') {
      const languages = [
        { id: 'lang_en', code: 'en', name: 'English' },
        { id: 'lang_hi', code: 'hi', name: 'Hindi' },
        { id: 'lang_mr', code: 'mr', name: 'Marathi' }
      ];
      return createSuccessResponse(languages, "Languages fetched successfully");
    }

    // 15.3 List Questions
    if (url === '/api/v1/questions') {
      const allQuestions = testsStore.flatMap(t => t.questions || []);
      return createPaginatedResponse(allQuestions, 0, 20, allQuestions.length, "Questions fetched successfully");
    }

    // 19.1 List Available Assessments for Student
    if (url.match(/\/api\/v1\/students\/[^/]+\/assessments$/)) {
      return createSuccessResponse(testsStore, "Assessments fetched successfully");
    }

    // 20.6 Get Student Scores
    if (url.match(/\/api\/v1\/students\/[^/]+\/scores$/)) {
      const scores = { R: 45, I: 50, A: 40, S: 60, E: 55, C: 50 };
      return createSuccessResponse(scores, "Student scores fetched successfully");
    }

    // 22.5 Get Student Recommendations
    if (url.match(/\/api\/v1\/students\/[^/]+\/recommendations$/)) {
      const recs = {
        recommendationRunId: 'run_001',
        studentId: 'usr_student_001',
        recommendations: careerDatabase[0] ? careerDatabase[0].careers : fallbackCareers
      };
      return createSuccessResponse(recs, "Student recommendations fetched successfully");
    }

    // 23.5 Get Student Reports
    if (url.match(/\/api\/v1\/students\/[^/]+\/reports$/)) {
      const reports = [
        {
          reportId: 'rep_001',
          studentId: 'usr_student_001',
          fileName: 'career-report-amit-kumar.pdf',
          generatedAt: '2026-07-24T10:00:00Z',
          downloadUrl: '/api/v1/reports/rep_001/download'
        }
      ];
      return createSuccessResponse(reports, "Student reports fetched successfully");
    }

    // 24.2 Get Student Feedback
    if (url.match(/\/api\/v1\/students\/[^/]+\/feedback$/)) {
      return createSuccessResponse(feedbackStore, "Student feedback fetched successfully");
    }

    // 25.1 Student Dashboard
    if (url.match(/\/api\/v1\/students\/[^/]+\/dashboard$/)) {
      const dash = {
        completedCount: 1,
        totalAssessments: testsStore.length,
        upcomingSession: "Friday 4:00 PM",
        pathwayStatus: "Active"
      };
      return createSuccessResponse(dash, "Student dashboard data fetched successfully");
    }

    // 25.3 Admin Dashboard
    if (url === '/api/v1/admin/dashboard') {
      const dash = {
        totalTests: testsStore.length,
        totalQuestions: testsStore.reduce((acc, t) => acc + t.questions.length, 0),
        totalStudents: usersStore.filter(u => u.userType === 'STUDENT').length,
        activeTestsCount: testsStore.filter(t => t.status === 'pending').length,
        testsOverview: testsStore
      };
      return createSuccessResponse(dash, "Admin dashboard data fetched successfully");
    }

    // 28.1 List Audit Logs
    if (url === '/api/v1/audit-logs') {
      return createPaginatedResponse(auditLogsStore, 0, 20, auditLogsStore.length, "Audit logs fetched successfully");
    }

    // Default fallback
    return createSuccessResponse({}, "Data fetched successfully");
  },

  // POST request dispatcher
  post: async (url, payload = {}) => {
    await delay(300);

    // 8.1 Register User
    if (url === '/api/v1/auth/register') {
      const newUser = {
        id: genId(),
        tenantId: MOCK_TENANT_ID,
        primaryOrgUnitId: MOCK_ORG_UNIT_ID,
        username: payload.email ? payload.email.split('@')[0] : 'user',
        email: payload.email || 'user@example.com',
        firstName: payload.firstName || 'New',
        lastName: payload.lastName || 'User',
        userType: payload.userType || 'STUDENT',
        roles: [payload.userType || 'STUDENT'],
        status: 'PENDING',
        completedTests: []
      };
      usersStore.push(newUser);
      return createSuccessResponse({ userId: newUser.id, userType: newUser.userType, status: 'PENDING' }, "User registered successfully");
    }

    // 8.2 Login User
    if (url === '/api/v1/auth/login') {
      const loginId = (payload.loginId || payload.username || '').trim().toLowerCase();
      const pwd = payload.password;
      const user = usersStore.find(u => (u.username.toLowerCase() === loginId || u.email.toLowerCase() === loginId));
      
      if (user && (pwd === 'student123' || pwd === 'admin123')) {
        const authData = {
          accessToken: `jwt-token-${genId()}`,
          refreshToken: `refresh-token-${genId()}`,
          expiresIn: 3600,
          user
        };
        // Log activity
        auditLogsStore.unshift({
          id: genId(),
          entityName: 'USER',
          entityId: user.id,
          performedBy: user.id,
          action: 'USER_LOGIN',
          details: `User ${user.username} logged in`,
          timestamp: new Date().toISOString()
        });
        return createSuccessResponse(authData, "Login successful");
      }
      return createErrorResponse("AUTH_INVALID_CREDENTIALS", "Invalid Username or Password.", [], url);
    }

    // 8.3 Logout
    if (url === '/api/v1/auth/logout') {
      return createSuccessResponse({}, "Logged out successfully");
    }

    // 9.1 Capture Consent
    if (url === '/api/v1/consents') {
      const consentRecord = {
        consentId: genId(),
        userId: payload.userId,
        consentType: payload.consentType || 'GUARDIAN',
        consentGivenAt: new Date().toISOString()
      };
      return createSuccessResponse(consentRecord, "Consent captured successfully");
    }

    // 10.1 Create User
    if (url === '/api/v1/users') {
      const newUser = {
        id: genId(),
        tenantId: payload.tenantId || MOCK_TENANT_ID,
        primaryOrgUnitId: payload.primaryOrgUnitId || MOCK_ORG_UNIT_ID,
        username: payload.email ? payload.email.split('@')[0] : 'user_' + genId(),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        userType: payload.userType || 'STUDENT',
        roles: payload.roleIds || ['STUDENT'],
        status: 'ACTIVE',
        completedTests: []
      };
      usersStore.push(newUser);
      return createSuccessResponse(newUser, "User created successfully");
    }

    // 15.2 Create Question
    if (url === '/api/v1/questions') {
      const newQuestion = {
        id: genId(),
        question: payload.defaultText || payload.question || 'New Question',
        options: payload.options || [],
        correctAnswer: payload.correctAnswer || 'A'
      };
      return createSuccessResponse(newQuestion, "Question created successfully");
    }

    // 17.1 Create Assessment
    if (url === '/api/v1/assessments') {
      const newTest = {
        id: genId(),
        title: payload.name || 'New Assessment',
        description: payload.description || 'Description',
        duration: '10 mins',
        questionsCount: 0,
        type: payload.code ? payload.code.toLowerCase() : 'aptitude',
        status: 'pending',
        accentClass: 'primary-accent',
        iconName: 'BrainCircuit',
        questions: []
      };
      testsStore.push(newTest);
      return createSuccessResponse(newTest, "Assessment created successfully");
    }

    // 19.2 Start Assessment
    if (url.match(/\/api\/v1\/assessments\/[^/]+\/start$/)) {
      const parts = url.split('/');
      const assessmentId = parts[parts.length - 2];
      const attemptData = {
        attemptId: genId(),
        assessmentId,
        timer: {
          timerMode: "COUNT_UP",
          startedAt: new Date().toISOString(),
          showTimerToStudent: true
        }
      };
      return createSuccessResponse(attemptData, "Assessment started successfully");
    }

    // 19.5 Submit Assessment
    if (url.match(/\/api\/v1\/attempts\/[^/]+\/submit$/)) {
      const submitData = {
        attemptId: genId(),
        status: "SUBMITTED",
        submittedAt: new Date().toISOString(),
        elapsedSeconds: 180,
        submissionReason: "MANUAL_SUBMIT",
        scoreStatus: "COMPLETED"
      };
      return createSuccessResponse(submitData, "Assessment submitted successfully");
    }

    // 24.1 Add Counsellor Feedback
    if (url.match(/\/api\/v1\/students\/[^/]+\/feedback$/)) {
      const fb = {
        id: genId(),
        studentId: payload.studentId || 'usr_student_001',
        reportId: payload.reportId || 'rep_001',
        feedbackText: payload.feedbackText,
        recommendationNotes: payload.recommendationNotes,
        visibility: payload.visibility || 'VISIBLE_TO_STUDENT',
        createdAt: new Date().toISOString()
      };
      feedbackStore.unshift(fb);
      return createSuccessResponse(fb, "Feedback saved successfully");
    }

    // 26.1 Send Notification
    if (url === '/api/v1/notifications/send') {
      return createSuccessResponse({ notificationId: genId(), status: 'SENT' }, "Notification sent successfully");
    }

    return createSuccessResponse(payload, "Operation completed successfully");
  },

  // PUT request dispatcher
  put: async (url, payload = {}) => {
    await delay(300);

    // 10.4 Update User
    if (url.match(/\/api\/v1\/users\/[^/]+$/)) {
      const parts = url.split('/');
      const userId = parts[parts.length - 1];
      usersStore = usersStore.map(u => u.id === userId ? { ...u, ...payload } : u);
      return createSuccessResponse({ userId, ...payload }, "User updated successfully");
    }

    // 15.4 Update Question
    if (url.match(/\/api\/v1\/questions\/[^/]+$/)) {
      return createSuccessResponse(payload, "Question updated successfully");
    }

    return createSuccessResponse(payload, "Updated successfully");
  },

  // PATCH request dispatcher
  patch: async (url, payload = {}) => {
    await delay(250);

    // 10.5 Update User Status
    if (url.match(/\/api\/v1\/users\/[^/]+\/status$/)) {
      const parts = url.split('/');
      const userId = parts[parts.length - 2];
      usersStore = usersStore.map(u => u.id === userId ? { ...u, status: payload.status } : u);
      return createSuccessResponse({ userId, status: payload.status }, "User status updated successfully");
    }

    return createSuccessResponse(payload, "Status patched successfully");
  },

  // DELETE request dispatcher
  delete: async (url) => {
    await delay(250);

    // 11.4 Remove Role from User
    if (url.match(/\/api\/v1\/users\/[^/]+\/roles\/[^/]+$/)) {
      return createSuccessResponse({}, "Role removed from user successfully");
    }

    return createSuccessResponse({}, "Deleted successfully");
  }
};
