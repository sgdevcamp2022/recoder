import roomService from '../service/room_service.js';

const roomController = {
  async createLink(req, res, next) {
    try {
      const invitationLink = await roomService.getLink();
      return res.status(200).send(invitationLink);
    } catch (err) {}
  }
};

export default roomController;
