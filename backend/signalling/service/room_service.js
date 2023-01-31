import urls from '../models/url_model.js';
import crypto from 'crypto';

const roomService = {
  async getLink() {
    const index = await urls.estimatedDocumentCount();
    let resJson = await this.createUrl(index);
    if (resJson == false) while (resJson == false) resJson = await this.createUrl(index);

    const url = resJson.createUrl;
    return url;
  },
  async createUrl(index) {
    const timeStamp = Date.now();
    const originUrl = timeStamp + 'createLink' + index;
    const hashedUrl = crypto.createHash('sha512').update(originUrl).digest('hex');
    const encodedUrl = Buffer.from(hashedUrl.slice(0, 10), 'utf8').toString('base64');

    const cursor = await urls.findOne({ createUrl: encodedUrl });
    if (cursor != null) return false;
    const urlData = new urls({ createUrl: encodedUrl, __v: index });

    return await urlData.save();
  }
};

export default roomService;
