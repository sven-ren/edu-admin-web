pipeline {
    agent any

    tools {
        nodejs 'NodeJs-20'   // 与全局工具配置中的名称一致
    }

    environment {
        // 限制 Node 内存，防止内存溢出
        NODE_OPTIONS = '--max-old-space-size=512'
        BUILD_DIR = 'dist'               // 根据你的项目构建输出目录调整
        DEPLOY_DIR = '/var/www/edu-admin-web'   // 替换为你的实际部署目录
    }

    stages {
        stage('Checkout') {
            steps {
                echo '拉取代码...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '安装依赖...'
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                echo '构建项目...'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo '部署到本地目录...'
                sh """
                    mkdir -p ${DEPLOY_DIR}
                    rm -rf ${DEPLOY_DIR}/*
                    cp -r ${BUILD_DIR}/* ${DEPLOY_DIR}/
                """
            }
        }
    }

    post {
        always {
            echo '清理工作空间...'
            cleanWs()
        }
        failure {
            echo '构建失败！请检查日志。'
        }
        success {
            echo '部署成功！'
        }
    }
}
