import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoint = appCommonTypes.RouteEndpoints;
import {
    createFAQHandler, deleteFAQHandler, fetchFAQHandler, getSingleFAQHandler, updateFAQHandler
} from '../../routes/faqRoute';

const faqEndpoints: RouteEndpoint  = [
    {
        name: 'create faq',
        method: 'post',
        path: '/faq',
        handler: createFAQHandler
    },
    {
        name: 'fetch faq',
        method: 'get',
        path: '/faqs',
        handler: fetchFAQHandler
    },
    {
        name: 'get single faq',
        method: 'get',
        path: '/single/faq/:faqId',
        handler: getSingleFAQHandler
    },
    {
        name: 'update faq',
        method: 'put',
        path: '/faq/:faqId',
        handler: updateFAQHandler
    },
    {
        name: 'delete faq',
        method: 'delete',
        path: '/faq/:faqId',
        handler: deleteFAQHandler
    }
]

export default faqEndpoints;