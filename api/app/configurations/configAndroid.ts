import { Request, Response, Application } from 'express';
import { environment } from './environment.js';

export function configAndroid(app: Application) {
    /**
     * Required by Android
     * https://www.branch.io/resources/blog/how-to-open-an-android-app-from-the-browser/
     * https://developer.android.com/training/app-links/verify-android-applinks
     */
    app.get('/.well-known/assetlinks.json', (req: Request, res: Response) => {
        res.json([
            {
                relation: ['delegate_permission/common.handle_all_urls'],
                target: {
                    namespace: 'android_app',
                    //need to change the package name
                    package_name: 'com.draw2form.ai',
                    sha256_cert_fingerprints: environment.APP_ANDROID_SHA256_CERT_FINGERPRINT.split(','),
                },
            },
        ]);
    });
}
