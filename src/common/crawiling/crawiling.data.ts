import { languageDetail } from './interface';

export const linkareerType = (path: string, i: number) => {
    let url, dataType;
    let interestsType = 'jss14';
    let detailClass = 'jss6';
    let mainImageType = 'card-image';

    switch (path) {
        case 'outside':
            url = `https://api.linkareer.com/graphql?operationName=ActivityList_Activities&variables=%7B%22filterBy%22%3A%7B%22status%22%3A%22OPEN%22%2C%22activityTypeID%22%3A%221%22%7D%2C%22pageSize%22%3A20%2C%22page%22%3A${
                i + 1
            }%2C%22activityOrder%22%3A%7B%22field%22%3A%22CREATED_AT%22%2C%22direction%22%3A%22DESC%22%7D%2C%22withManager%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%228825f82938c33738717c30842b55557c56990f963907c69bac8e9d19ea484359%22%7D%7D`;
            dataType = {
                institution: '',
                target: '',
                date: '',
                participationPeriod: '',
                personnel: '',
                location: '',
                preferentialTreatment: '',
                homePage: '',
                benefits: '',
                interests: '',
                field: '',
            };

            break;

        case 'intern':
            url = `https://api.linkareer.com/graphql?operationName=RecruitList&variables=%7B%22filterBy%22%3A%7B%22status%22%3A%22OPEN%22%2C%22activityTypeID%22%3A%225%22%2C%22jobTypes%22%3A%5B%22INTERN%22%5D%2C%22categoryIDs%22%3A%5B%5D%7D%2C%22activityOrder%22%3A%7B%22field%22%3A%22RECENT%22%2C%22direction%22%3A%22DESC%22%7D%2C%22page%22%3A${
                i + 1
            }%2C%22pageSize%22%3A20%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22cacb5fff62346779e715a849c212cd8ce31b37c4154bb7e6508239063281c825%22%7D%7D`;
            dataType = {
                institution: '',
                date: '',
                preferentialTreatment: '',
                personnel: '',
                target: '',
                homePage: '',
                location: '',
            };
            detailClass = 'jss5';
            mainImageType = 'recruit-image';

            break;
        default:
            url = `https://api.linkareer.com/graphql?operationName=ActivityList_Activities&variables=%7B%22filterBy%22%3A%7B%22status%22%3A%22OPEN%22%2C%22activityTypeID%22%3A%223%22%7D%2C%22pageSize%22%3A20%2C%22page%22%3A${
                i + 1
            }%2C%22activityOrder%22%3A%7B%22field%22%3A%22CREATED_AT%22%2C%22direction%22%3A%22DESC%22%7D%2C%22withManager%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%228825f82938c33738717c30842b55557c56990f963907c69bac8e9d19ea484359%22%7D%7D`;
            dataType = {
                institution: '',
                target: '',
                scale: '',
                date: '',
                homePage: '',
                benefits: '',
                interests: '',
            };
            interestsType = 'jss13';

            break;
    }

    return { url, dataType, detailClass, mainImageType, interestsType };
};

export const languageType = (test: string) => {
    let url = 'https://www.toeicswt.co.kr/receipt/examSchList.php';
    let testType = 'tbody > tr';
    let dataObj: languageDetail = {
        turn: '',
        Dday: '',
        resultDay: '',
        date: '',
    };

    switch (test) {
        case 'toeic':
            url = 'https://exam.toeic.co.kr/receipt/examSchList.php';
            break;
        case 'toeicBR':
            url = 'https://www.toeicbridge.co.kr/receipt/examSchList.php';
            dataObj = { Dday: '', resultDay: '', date: '' };
            break;
        case 'toeicSW':
            testType = 'tr.speakingwriting';
            dataObj = { Dday: '', resultDay: '', date: '' };
            break;
        case 'toeicWT':
            testType = 'tr.writing';
            dataObj = { Dday: '', resultDay: '', date: '' };
            break;
        case 'toeicST':
            dataObj = { Dday: '', resultDay: '', date: '' };
            break;
        case 'ch':
            url = 'https://www.ybmtsc.co.kr/receipt/examSchList.php';
            break;
        case 'jp':
            url = 'https://www.jpt.co.kr/receipt/examSchList.php';
            break;
        case 'jpSP':
            url = 'https://www.ybmsjpt.co.kr/receipt/examSchList.php';
            break;
    }

    return { url, testType, dataObj };
};
