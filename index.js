const AWS = require('aws-sdk');
const Sharp = require('sharp');
const S3 = new AWS.S3({region: 'ap-northeast-2'});
AWS.config.loadFromPath(__dirname + '/s3.json');

exports.handler = async (event, context) => {
    const Bucket = event.bucket;//wherewhere
    const Key = event.key;//images/original/{filename}
    console.log(Bucket, Key)
    const filename = Key.split('original/')[1]; 
    const ext = filename.split('.')[1];
    console.log('check ::: ', Bucket, Key, filename, ext);
    try { 
        const s3Object = await S3.getObject({
            // S3로부터 이미지를 get 
            Bucket,
            Key, 
        }).promise();

        console.log('original', s3Object.Body.length);
        
        const resizedImage = await Sharp(s3Object.Body) // Sharp 패키지를 이용한 리사이즈 진행 
        .resize(400, 400, { 
            fit: 'inside', 
        })
        .toBuffer(); 
        
        console.log('resized', resizedImage);
        
        await S3.putObject({ // 리사이즈한 이미지를 thumb 폴더에 저장한다. 
            Body: resizedImage, 
            Bucket: Bucket, 
            Key: `images/resized/${filename}`, 
        }).promise(); 

        await S3.copyObject({
            Bucket: Bucket,
            CopySource: encodeURI(`${Bucket}/${Key}`),
            Key: `images/complete/${filename}`
        }).promise();

        await S3.deleteObject({
            Bucket: Bucket,
            Key: Key
        }).promise();

        const resizedObject = await S3.getObject({
            Bucket: Bucket,
            Key: `images/resized/${filename}`
        }).promise();

        console.log(`success :: ${filename}`); 
        console.log('resizedObject : ', resizedObject);
        //key 값을 바탕으로 경로 바꿔주고 copy await 실행 후에 delete await 실행
        const success = "success"
        return success;
        
    } catch (error) {
        console.error(error); 
        return error;
    } 
};



// exports.handler = async (event, context, callback) => {
//     console.log('event : ', event.Records[0].s3);
//     const Bucket = event.Records[0].s3.bucket.name;
//     const Key = decodeURIComponent(
//         event.Records[0].s3.object.key.replace(/\+/g, ' ')
//     ); 
//     const filename = Key.split('/')[Key.split('/').length - 1]; 
//     const ext = Key.split('.')[Key.split('.').length - 1];
//     console.log('check ::: ', Bucket, Key, filename, ext);
//     try { 
//         const s3Object = await S3.getObject({
//             // S3로부터 이미지를 get 
//             Bucket,
//             Key, 
//         }).promise();

//         console.log('original', s3Object.Body.length);
        
//         const resizedImage = await Sharp(s3Object.Body) // Sharp 패키지를 이용한 리사이즈 진행 
//         .resize(400, 400, { 
//             fit: 'inside', 
//         })
//         .toBuffer(); 
        
//         console.log('resized', resizedImage);
        
//         await S3.putObject({ // 리사이즈한 이미지를 thumb 폴더에 저장한다. 
//             Body: resizedImage, 
//             Bucket: Bucket, 
//             Key: `images/resized/${filename}`, 
//         }).promise(); 

//         await S3.copyObject({
//             Bucket: Bucket,
//             CopySource: encodeURI(`${Bucket}/${Key}`),
//             Key: `images/complete/${filename}`
//         }).promise();

//         await S3.deleteObject({
//             Bucket: Bucket,
//             Key: Key
//         }).promise();


//         console.log(`success :: ${filename}`); 
        
//         //key 값을 바탕으로 경로 바꿔주고 copy await 실행 후에 delete await 실행
        
//         return callback(null, `${filename}`);
        
//     } catch (error) {
//         console.error(error); 
//         return callback(error); 
//     } 
// };

