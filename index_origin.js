const AWS = require('aws-sdk');
const Sharp = require('sharp');
const S3 = new AWS.S3({region: 'ap-northeast-2'});
AWS.config.loadFromPath(__dirname + '/s3.json');

exports.handler = async (event, context, callback) => {

    const Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(
        event.Records[0].s3.object.key.replace(/\+/g, ' ')
    ); 
    const filename = Key.split('/')[Key.split('/').length - 1]; 
    const ext = Key.split('.')[Key.split('.').length - 1];
    console.log('check ::: ', Bucket, Key, filename, ext);

    try { 
        // S3로부터 이미지를 get 
        const s3Object = await S3.getObject({
            Bucket,
            Key, 
        }).promise();

        //console.log('original', s3Object.Body.length);

        // Sharp 패키지를 이용한 리사이즈 진행 
        const resizedImage = await Sharp(s3Object.Body)
        .resize(400, 400, { 
            fit: 'inside', 
        })
        .toBuffer(); 

        console.log('resized', resizedImage);
        
        // 리사이즈한 이미지를 thumb 폴더에 저장한다. 
        await S3.putObject({
            Body: resizedImage, 
            Bucket, 
            Key: `thumb/${filename}`, 
        }).promise(); 

        console.log(`success::thumb/${filename}`); 
        return callback(null, `thumb/${filename}`); 
    } catch (error) {
        console.error(error); 
        return callback(error); 
    } 
};