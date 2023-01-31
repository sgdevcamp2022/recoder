import testService from '../service/test_service.js';

const testController = {
  getTest(req, res) {
    const message = testService.testFunction();
    res.send(message);
  }
};

export default testController;
