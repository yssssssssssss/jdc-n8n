const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('开始检查数据库用户数据...');
    
    const users = await prisma.user.findMany();
    
    console.log(`总用户数: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n用户数据:');
      users.forEach((user, index) => {
        console.log(`\n用户 ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  邮箱: ${user.email}`);
        console.log(`  姓名: ${user.name}`);
        console.log(`  密码哈希: ${user.passwordHash.substring(0, 30)}...`);
        console.log(`  创建时间: ${user.createdAt}`);
        console.log(`  更新时间: ${user.updatedAt}`);
        
        // 验证数据完整性
        const isValid = user.id && user.email && user.name && user.passwordHash;
        console.log(`  数据完整性: ${isValid ? '✓ 完整' : '✗ 不完整'}`);
        
        // 检查密码哈希格式
        const isBcryptHash = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$');
        console.log(`  密码加密: ${isBcryptHash ? '✓ 正确加密' : '✗ 未正确加密'}`);
      });
    } else {
      console.log('数据库中没有用户数据');
    }
    
    console.log('\n数据库检查完成');
    
  } catch (error) {
    console.error('数据库检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();