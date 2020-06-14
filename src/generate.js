const qs = require('querystring');

module.exports.handler = async event => {
    const response = {statusCode: 200};
    try {
        const payload = qs.decode(event.body);
        response.body = JSON.stringify({
            response_type: "ephemeral",
            text: "Please click the link provided below.",
            attachments:[
                {
                   "text":`Activation link: <${generate_url(event.body)}|allow-access-for-${payload.user_name}>`
                }
            ]
        });
    } catch (e) {
       response.statusCode = 400;
       response.body = e.message || 'Error in execution'
    }
    return response;
};

const generate_url = (payload) => {
    const endpoint = process.env.API_URL;
    return `${endpoint}connect?${payload}`;
};
