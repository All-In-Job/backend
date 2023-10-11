import { Client } from '@elastic/elasticsearch';
import { Service } from 'typedi';
import { url } from '../common/util/callbackUrl';

@Service()
export class ElasitcClient extends Client {
    constructor() {
        const auth = !url().origin
            ? { node: process.env.ELASTIC_URL }
            : {
                  cloud: {
                      id: process.env.ELASTIC_CLOUD_ID!,
                  },
                  auth: {
                      apiKey: process.env.ELASTIC_API_KEY!,
                  },
              };
        super({
            ...auth,
        });
        this.ping()
            .then(() => console.log('Elastic 연결 성공'))
            .catch((err) => console.log('Elastic 실패', err));
    }
}
