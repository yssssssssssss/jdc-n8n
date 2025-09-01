const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('开始检查数据库用户数据...');
    
    // 获取所有用户
    const users = await prisma.user.findMany();
    
    console.log(`\n=== 数据库中的用户数据 ===`);
    console.log(`总用户数: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\n用户 ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  邮箱: ${user.email}`);
        console.log(`  姓名: ${user.name}`);
        console.log(`  密码哈希: ${user.passwordHash.substring(0, 20)}...`);
        console.log(`  创建时间: ${user.createdAt}`);
        console.log(`  更新时间: ${user.updatedAt}`);
        
        // 验证数据完整性
        const isValid = user.id && user.email && user.name && user.passwordHash;
        console.log(`  数据完整性: ${isValid ? '✓ 完整' : '✗ 不完整'}`);
        
        // 检查密码哈希格式（bcrypt格式）
        const isBcryptHash = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$');
        console.log(`  密码加密: ${isBcryptHash ? '✓ 正确加密' : '✗ 未正确加密'}`);
        
        // 检查邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(user.email);
        console.log(`  邮箱格式: ${isValidEmail ? '✓ 有效' : '✗ 无效'}`);
      });
    } else {
      console.log('数据库中没有用户数据');
    }
    
    // 检查数据库连接
    console.log('\n=== 数据库连接测试 ===');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ 数据库连接正常');
    
    // 检查用户表结构
    console.log('\n=== 用户表结构检查 ===');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('用户表字段:');
    tableInfo.forEach(column => {
      console.log(`  ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? '(必填)' : '(可选)'}`);
    });
    
    console.log('\n=== 数据库检查完成 ===');
    
  } catch (error) {
    console.error('数据库检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase