#!groovy

// Now that the KNIME AP build is moved to the new build system:
// - investigate the role of the maven build vs the nodeJS build and see if they can be combined

def BN = BRANCH_NAME == "master" || BRANCH_NAME.startsWith("releases/") ? BRANCH_NAME : "master"

library "knime-pipeline@$BN"

properties([
    buildDiscarder(logRotator(numToKeepStr: '5')),
    disableConcurrentBuilds()
])

timeout(time: 15, unit: 'MINUTES') {
    try {
        node('nodejs') {
            cleanWs()
            checkout scm
            knimetools.reportJIRAIssues()

            stage('Install npm Dependencies') {
                env.lastStage = env.STAGE_NAME
                sh '''
                    npm ci
                '''
            }

            stage('Security Audit') {
                env.lastStage = 'Security Audit'

                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    retry(3) { // because npm registry sometimes breaks
                        sh '''
                            npm run audit
                        '''
                    }
                }
            }

            stage('Static Code Analysis') {
                env.lastStage = 'Lint'
                sh '''
                    npm run lint
                '''
            }

            stage('Unit Tests') {
                env.lastStage = env.STAGE_NAME
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                // trows exception on failing test
                    sh '''
                        npm run coverage -- --ci
                    '''
                }
                junit 'coverage/junit.xml'
            }

            if (BRANCH_NAME == "master") {
                stage('Upload Coverage data') {
                    env.lastStage = env.STAGE_NAME
                    withCredentials([usernamePassword(credentialsId: 'SONAR_CREDENTIALS', passwordVariable: 'SONAR_PASSWORD', usernameVariable: 'SONAR_LOGIN')]) {
                        sh '''
                            npm run sendcoverage
                        '''
                    }
                }
                if (currentBuild.result != 'UNSTABLE') {
                    stage('Build and deploy to npm') {
                        env.lastStage = env.STAGE_NAME
                        withCredentials([string(credentialsId: 'NPM_AUTH_TOKEN', variable: 'NPM_AUTH_TOKEN'),
                            gitUsernamePassword(credentialsId: 'bitbucket-jenkins')]) {
                            sh '''
                                npm run build
                                npm version patch
                                echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ~/.npmrc
                                npm publish 
                            '''
                        }
                    }
                }
            }
        }

    } catch (ex) {
        currentBuild.result = 'FAILED'
        throw ex
    }
}
