ffmpeg(inFilename)
                .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
                .save(outFilename)
                .once('end', function () {
                    console.log('convert end');
                    
                    console.log("push video start");
                    const videoMime = mime.getType(outFilename);
                    fs.readFile(outFilename, function (error, data) {
                        if (error) {
                            console.log("file error");
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.end('500 Internal Server ' + error);
                        } else {
                            console.log("file success");
                            // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
                            res.writeHead(200, { 'Content-Type': videoMime });
                            res.end(data);
                        }
                    });
                    console.log("push video end");
                })