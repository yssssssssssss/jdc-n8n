const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3003';
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123456',
  name: 'Test User'
};

let authToken = '';

// 颜色输出函数
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试用户注册
async function testUserRegistration() {
  log('\n=== 测试用户注册 ===', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    
    if (response.status === 201) {
      log('✓ 用户注册成功', 'green');
      log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
      
      // 检查响应是否包含必要字段
      if (response.data.user) {
        log('✓ 响应包含用户信息', 'green');
        // 注册成功，但没有返回token，这是正常的
      } else {
        log('✗ 响应缺少用户信息', 'red');
      }
    } else {
      log(`✗ 注册失败，状态码: ${response.status}`, 'red');
    }
  } catch (error) {
    if (error.response) {
      log(`✗ 注册失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`✗ 注册请求失败: ${error.message}`, 'red');
    }
  }
}

// 测试用户登录
async function testUserLogin() {
  log('\n=== 测试用户登录 ===', 'blue');
  
  try {
    const loginData = {
      email: TEST_USER.email,
      password: TEST_USER.password
    };
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    if (response.status === 200) {
      log('✓ 用户登录成功', 'green');
      log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
      
      // 检查响应是否包含必要字段
      if (response.data.user && response.data.access_token) {
        log('✓ 响应包含用户信息和令牌', 'green');
        authToken = response.data.access_token;
      } else {
        log('✗ 响应缺少必要字段', 'red');
      }
    } else {
      log(`✗ 登录失败，状态码: ${response.status}`, 'red');
    }
  } catch (error) {
    if (error.response) {
      log(`✗ 登录失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`✗ 登录请求失败: ${error.message}`, 'red');
    }
  }
}

// 测试JWT令牌验证
function testJWTToken() {
  log('\n=== 测试JWT令牌验证 ===', 'blue');
  
  if (!authToken) {
    log('✗ 没有可用的认证令牌', 'red');
    return;
  }
  
  try {
    // 解码JWT令牌（不验证签名）
    const decoded = jwt.decode(authToken, { complete: true });
    
    if (decoded) {
      log('✓ JWT令牌格式正确', 'green');
      log(`令牌头部: ${JSON.stringify(decoded.header, null, 2)}`);
      log(`令牌载荷: ${JSON.stringify(decoded.payload, null, 2)}`);
      
      // 检查必要字段
      if (decoded.payload.sub && decoded.payload.email) {
        log('✓ 令牌包含必要的用户信息', 'green');
      } else {
        log('✗ 令牌缺少必要的用户信息', 'red');
      }
      
      // 检查过期时间
      if (decoded.payload.exp) {
        const expirationDate = new Date(decoded.payload.exp * 1000);
        log(`令牌过期时间: ${expirationDate.toISOString()}`);
        
        if (expirationDate > new Date()) {
          log('✓ 令牌尚未过期', 'green');
        } else {
          log('✗ 令牌已过期', 'red');
        }
      }
    } else {
      log('✗ JWT令牌解码失败', 'red');
    }
  } catch (error) {
    log(`✗ JWT令牌验证失败: ${error.message}`, 'red');
  }
}

// 测试受保护的路由（如果有的话）
async function testProtectedRoute() {
  log('\n=== 测试受保护的路由 ===', 'blue');
  
  if (!authToken) {
    log('✗ 没有可用的认证令牌', 'red');
    return;
  }
  
  try {
    // 测试带有Authorization头的请求
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200) {
      log('✓ 受保护路由访问成功', 'green');
      log(`用户资料: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log(`✗ 受保护路由访问失败，状态码: ${response.status}`, 'red');
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log('! 受保护路由不存在（/api/auth/profile），这是正常的', 'yellow');
    } else if (error.response) {
      log(`✗ 受保护路由访问失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`✗ 受保护路由请求失败: ${error.message}`, 'red');
    }
  }
}

// 测试服务器健康状态
async function testServerHealth() {
  log('\n=== 测试服务器健康状态 ===', 'blue');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      log('✓ 服务器健康检查通过', 'green');
      log(`健康状态: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log(`✗ 服务器健康检查失败，状态码: ${response.status}`, 'red');
    }
  } catch (error) {
    if (error.response) {
      log(`✗ 健康检查失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`✗ 健康检查请求失败: ${error.message}`, 'red');
    }
  }
}

// 测试错误情况
async function testErrorCases() {
  log('\n=== 测试错误情况 ===', 'blue');
  
  // 测试重复注册
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    log('✗ 重复注册应该失败但成功了', 'red');
  } catch (error) {
    if (error.response && error.response.status === 409) {
      log('✓ 重复注册正确返回409冲突错误', 'green');
    } else {
      log(`! 重复注册返回了意外的错误: ${error.response?.status}`, 'yellow');
    }
  }
  
  // 测试错误密码登录
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: 'wrongpassword'
    });
    log('✗ 错误密码登录应该失败但成功了', 'red');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✓ 错误密码登录正确返回401未授权错误', 'green');
    } else {
      log(`! 错误密码登录返回了意外的错误: ${error.response?.status}`, 'yellow');
    }
  }
  
  // 测试不存在的用户登录
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'password'
    });
    log('✗ 不存在用户登录应该失败但成功了', 'red');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✓ 不存在用户登录正确返回401未授权错误', 'green');
    } else {
      log(`! 不存在用户登录返回了意外的错误: ${error.response?.status}`, 'yellow');
    }
  }
}

// 主测试函数
async function runTests() {
  log('开始认证模块测试...', 'blue');
  log(`测试服务器: ${BASE_URL}`, 'blue');
  
  await testServerHealth();
  await testUserRegistration();
  await testUserLogin();
  testJWTToken();
  await testProtectedRoute();
  await testErrorCases();
  
  log('\n=== 测试完成 ===', 'blue');
}

// 运行测试
runTests().catch(error => {
  log(`测试运行失败: ${error.message}`, 'red');
  process.exit(1);
});