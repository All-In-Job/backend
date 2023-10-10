import axios from 'axios';
import cheerio from 'cheerio';
import { languageType, linkareerType } from './crawiling.data';
import {
    createLinkareerPaths,
    createPaths,
    examSchedule,
    itmeType,
} from './interface';
import { CrawlingService } from '../../apis/crawling/crawling.service';
import { Service } from 'typedi';
import { QNetObj } from './seed.q-net';
import iconv from 'iconv-lite';
const decode = require('decode-html');

@Service()
export class PathCrawling {
    constructor(
        private readonly crawlingServcie: CrawlingService, //
    ) {}

    async linkareerData(path: createLinkareerPaths) {
        // 이중 배열 만들때 -> 깊은 복사 때문이다.
        // Array.from({ length: 3 }, () => {
        //     return Array.from({ length: 3 }, () => 0);
        // });

        return Array(3)
            .fill(0)
            .map(async (_, i) => {
                let month: number;
                const {
                    url,
                    dataType,
                    detailClass,
                    mainImageType,
                    interestsType,
                } = linkareerType(path, i);
                const dataList = await axios.get(url);

                return dataList.data.data.activities.nodes.map(
                    async (el: any) => {
                        const result = await axios.get(
                            `https://linkareer.com/activity/${el.id}`,
                        );
                        const $ = cheerio.load(result.data);
                        $(`h3.${detailClass}`).each((index, el) => {
                            const key = Object.keys(dataType)[index];
                            if (key) {
                                dataType[key as keyof typeof dataType] =
                                    $(el).text();
                            }
                        });

                        if (path === 'outside' || path === 'competition') {
                            const interests = $(`span.${interestsType}`)
                                .map((_, el) => $(el).html())
                                .get()
                                .join(', ');
                            dataType.interests = interests;
                            if (path === 'outside') {
                                // 개월수 계산
                                const participationPeriod: any[] =
                                    dataType.participationPeriod!.split(' ~ ');
                                if (participationPeriod.length > 1) {
                                    const [start, end] =
                                        participationPeriod.map((el) => {
                                            const [year, month, day] =
                                                el.split('.');
                                            return new Date(
                                                `20${year}-${month}-${day}`,
                                            ).getTime();
                                        });
                                    month = Math.ceil(
                                        (end - start) /
                                            (1000 * 60 * 60 * 24) /
                                            30,
                                    );
                                } else month = 0;
                                const field = $('span.jss17')
                                    .map((_, el) => $(el).html())
                                    .get()
                                    .join(', ');
                                dataType.field = field;
                            } else {
                                dataType.scale = dataType.scale!.replace(
                                    '만 원',
                                    '',
                                );
                                dataType.scale = dataType.scale!.replace(
                                    '억 원',
                                    '0000',
                                );
                                dataType.scale = dataType.scale!.replace(
                                    '억 ',
                                    '',
                                );
                            }
                        }

                        const data = {
                            Dday: $('.recruitText').text(),
                            title: $('h2.title').text(),
                            view: +String($('span.count').html()),
                            mainImage: $(`img.${mainImageType}`).attr('src'),
                            organization: $('h2.organization-name').text(),
                            ...dataType,
                            detail: $(
                                'div.ActivityDetailTabContent__StyledWrapper-sc-5db6cf4b-0.bDYgjm',
                            ).html(),
                        };

                        return this.crawlingServcie.createLinkareerData({
                            data,
                            path,
                            month,
                        });
                    },
                );
            });
    }

    async languageData({ test, path }: createPaths) {
        const { testType, dataObj, url } = languageType(test);
        const result = await axios.get(url);
        const $ = cheerio.load(result.data);
        $(testType).each((_, el) => {
            $(el)
                .find('td')
                .each((indexs, els) => {
                    const key = Object.keys(dataObj)[indexs];
                    if (key) {
                        dataObj[key as keyof typeof dataObj] = $(els)
                            .text()
                            .replace(/\s+/g, '');
                    }
                });
            let classify: string = '영어';
            if (test.includes('ch')) classify = '중국어';
            else if (test.includes('jp')) classify = '일본어';
            this.crawlingServcie.createLanguageData({
                test,
                classify,
                homePage: url,
                dataObj,
            });
        });
        return ['true'];
    }

    async QNetData() {
        const category = await axios.get(
            'http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList?serviceKey=sWAEtBKCgnfT4ANvlYmgqRju8t9TcJHpyQvLY5zz6qu%2BRzrrMv%2FQyMHjzYUbtK%2FTJqePrdyM2nVPzTwEImSGvQ%3D%3D',
        );
        let categoryObj = {};
        await Promise.all(
            category.data.response.body.items.item.map(async (el: itmeType) => {
                const {
                    mdobligfldnm: subKeyword,
                    obligfldnm: mainKeyword,
                    jmcd,
                } = el;
                if (QNetObj[jmcd]) {
                    categoryObj = {
                        mainCategory: mainKeyword,
                        subCategory: subKeyword,
                    };

                    // return await this.crawlingServcie.createMainCategory(
                    //     mainKeyword,
                    //     subKeyword,
                    // );
                }
            }),
        );

        const listUrl =
            'http://openapi.q-net.or.kr/api/service/rest/InquiryQualInfo/getList?serviceKey=sWAEtBKCgnfT4ANvlYmgqRju8t9TcJHpyQvLY5zz6qu%2BRzrrMv%2FQyMHjzYUbtK%2FTJqePrdyM2nVPzTwEImSGvQ%3D%3D&seriesCd=';

        // 국가기술자격
        const dataList = await Promise.all(
            ['01', '02', '03', '04'].map(async (el) => {
                return await axios
                    .get(`${listUrl}${el}`)
                    .then((result) => result.data.response.body.items.item)
                    .catch((err) => console.log(err));
            }),
        );

        dataList.forEach((arr) => {
            arr.forEach(async (el: itmeType) => {
                const { jmCd, implNm, engJmNm, instiNm, jmNm, mdobligFldNm } =
                    el;
                if (QNetObj[jmCd]) {
                    const dataList = await axios.get(
                        `https://www.q-net.or.kr/crf005.do?id=crf00503s02&gSite=Q&gId=&jmCd=${jmCd}&jmInfoDivCcd=B0&jmNm=${implNm}`,
                        { responseType: 'arraybuffer' },
                    );
                    const decodedHTML = iconv.decode(dataList.data, 'EUC-KR');
                    const $ = cheerio.load(decodedHTML);
                    const examSchedules: examSchedule[] = [];

                    $('tbody > tr').each((_, el) => {
                        const examScheduleObj = {
                            turn: '',
                            wtReceipt: '',
                            wtDday: '',
                            wtResultDay: '',
                            ptReceipt: '',
                            ptDday: '',
                            resultDay: '',
                        };
                        $(el)
                            .find('td')
                            .each((indexs, els) => {
                                const key =
                                    Object.keys(examScheduleObj)[indexs];
                                if (key) {
                                    examScheduleObj[
                                        key as keyof typeof examScheduleObj
                                    ] = $(els).text().replace(/\s+/g, '');
                                }
                            });
                        examSchedules.push(examScheduleObj);
                    });

                    let detail =
                        $('div.dlInfo.mb40').text() &&
                        decode($('div.dlInfo.mb40').html());

                    detail = detail.replaceAll(
                        /<textarea[^>]*>([\s\S]*?)<body[^>]*>/gi,
                        '',
                    );
                    detail = detail.replaceAll(
                        /<\/body[^>]*>([\s\S]*?)<\/textarea[^>]*>/gi,
                        '',
                    );
                    const data = {
                        detail,
                        scheduleInfo: $('div.infoBox.mt10.mb40').html() ?? '',
                        examSchedules,
                        jmNm,
                        engJmNm,
                        instiNm,
                        implNm,
                    };

                    await this.crawlingServcie.createQNetData({
                        data,
                        categoryObj,
                    });
                }
            });
        });
        return ['true'];
    }
}
