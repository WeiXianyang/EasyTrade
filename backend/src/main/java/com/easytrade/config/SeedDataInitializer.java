package com.easytrade.config;

import com.easytrade.entity.User;
import com.easytrade.entity.Category;
import com.easytrade.entity.Product;
import com.easytrade.repository.CategoryRepository;
import com.easytrade.repository.ProductRepository;
import com.easytrade.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SeedDataInitializer implements CommandLineRunner {
  private final UserRepository users;
  private final CategoryRepository categories;
  private final ProductRepository products;
  private final PasswordEncoder passwordEncoder;

  public SeedDataInitializer(
      UserRepository users,
      CategoryRepository categories,
      ProductRepository products,
      PasswordEncoder passwordEncoder) {
    this.users = users;
    this.categories = categories;
    this.products = products;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    seedUsers();
    seedCategories();
    seedProducts();
  }

  private void seedUsers() {
    if (users.count() > 0) {
      return;
    }
    users.save(
        User.customer(
            "u-demo",
            "buyer",
            "buyer@example.com",
            "13800000000",
            passwordEncoder.encode("123456"),
            "校园买手",
            "张三",
            "13800000000",
            "北京市海淀区学院路 1 号"));
    users.save(User.admin("a-admin", "admin", passwordEncoder.encode("admin123"), "admin", "系统管理员"));
    users.save(
        User.admin("a-operator", "operator", passwordEncoder.encode("operator123"), "operator", "订单运营"));
  }

  private void seedCategories() {
    if (categories.count() > 0) {
      return;
    }
    categories.saveAll(
        List.of(
            new Category("digital", "数码潮品", "手机、耳机、智能设备"),
            new Category("home", "品质生活", "小家电、收纳、香氛"),
            new Category("food", "精选食品", "咖啡、零食、轻食"),
            new Category("sports", "运动户外", "训练、出行、露营")));
  }

  private void seedProducts() {
    if (products.count() > 0) {
      return;
    }
    products.saveAll(
        List.of(
            product(
                "p-phone",
                "Aurora X1 智能手机",
                "轻薄机身，全天候影像系统",
                "digital",
                3999,
                4599,
                38,
                1260,
                "on",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
                List.of("新品", "热卖"),
                "搭载高刷屏、长续航和夜景算法，适合移动办公与日常拍摄。"),
            product(
                "p-watch",
                "Pulse Pro 运动手表",
                "健康监测与长续航训练助手",
                "digital",
                899,
                1099,
                56,
                860,
                "on",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
                List.of("运动", "智能"),
                "支持心率、睡眠、运动记录和消息提醒，适合学生日常通勤与训练。"),
            product(
                "p-coffee",
                "晨光冷萃咖啡套装",
                "低酸顺滑，6 瓶组合装",
                "food",
                79,
                99,
                120,
                2300,
                "on",
                "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
                List.of("限时", "高复购"),
                "精选阿拉比卡咖啡豆，冷萃工艺保留香气，适合学习和办公场景。"),
            product(
                "p-lamp",
                "Luma 护眼台灯",
                "无频闪调光，宿舍书桌友好",
                "home",
                189,
                239,
                44,
                710,
                "on",
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
                List.of("学习", "护眼"),
                "三档色温、触控调光，夜间阅读更舒适。"),
            product(
                "p-shoes",
                "BreezeRun 轻跑鞋",
                "回弹缓震，校园跑步优选",
                "sports",
                329,
                429,
                67,
                540,
                "on",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                List.of("户外", "舒适"),
                "透气网面与轻量中底，适合日常训练和短途出行。"),
            product(
                "p-speaker",
                "Nest Mini 蓝牙音箱",
                "小体积，大声场",
                "home",
                259,
                299,
                0,
                390,
                "off",
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
                List.of("下架", "展示"),
                "下架商品用于演示后台上下架与前台联动效果。")));
  }

  private Product product(
      String id,
      String name,
      String subtitle,
      String categoryId,
      int price,
      int originalPrice,
      int stock,
      int sold,
      String status,
      String image,
      List<String> tags,
      String description) {
    Product product = new Product();
    product.setId(id);
    product.setName(name);
    product.setSubtitle(subtitle);
    product.setCategoryId(categoryId);
    product.setPrice(BigDecimal.valueOf(price));
    product.setOriginalPrice(BigDecimal.valueOf(originalPrice));
    product.setStock(stock);
    product.setSold(sold);
    product.setStatus(status);
    product.setImage(image);
    product.setTags(tags);
    product.setDescription(description);
    return product;
  }
}
