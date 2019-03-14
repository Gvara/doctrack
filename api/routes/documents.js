const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

//const Document = require('../../models/document');
const Document  = require('../../models/test_doc');
const TestDocsDataController = require('../controllers/test_docs_data');
const DocsDataController = require('../controllers/docs_data');

// router.get('/', checkAuth, TestDocsDataController.docs_get_onload);

// router.get('/:id', checkAuth, TestDocsDataController.doc_get_by_id);

// router.post('/', checkAuth, TestDocsDataController.doc_create);

// router.delete('/:id', checkAuth, TestDocsDataController.doc_delete_by_id);

router.get('/', checkAuth, DocsDataController.docs_get);

router.get('/:id', checkAuth, DocsDataController.doc_get_by_id);

router.get('/intro/:id', checkAuth, DocsDataController.intro_doc_get_by_id);

router.post('/', checkAuth, DocsDataController.doc_create);

router.post('/:id/stage', checkAuth, DocsDataController.stage_create);

router.post('/:id/task', checkAuth, DocsDataController.task_create);

router.patch('/:id/stage_done', checkAuth, DocsDataController.stage_done);

router.patch('/:id/stage', checkAuth, DocsDataController.stage_update_multiselect);

router.patch('/:id/stage_position', checkAuth, DocsDataController.stage_change_position);

router.delete('/:id', checkAuth, DocsDataController.doc_delete_by_id);

router.delete('/:id/stage', checkAuth, DocsDataController.stage_delete_by_id);

router.delete('/:id/task', checkAuth, DocsDataController.task_delete_by_id);

module.exports = router;