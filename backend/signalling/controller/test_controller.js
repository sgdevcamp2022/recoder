import testService from "../service/test_service.js";

const testController = {
  getTest(req, res, next) {
    const message = testService.testFunction();
    res.send(message);
  },
};

export default testController;
