CREATE DATABASE IF NOT EXISTS sec3_gr4_database;
USE sec3_gr4_database;

CREATE TABLE IF NOT EXISTS Admin_Info (
    Admin_ID CHAR(7) PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(250),
    Dateofbirth DATE NOT NULL,
    Email VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Admin_Login (
    Admin_ID CHAR(7),
    Password VARCHAR(100) NOT NULL,
    Login_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Logout_Time TIMESTAMP,
    PRIMARY KEY (Admin_ID, Login_Time), 
    FOREIGN KEY (Admin_ID) REFERENCES Admin_Info(Admin_ID)
);

CREATE TABLE IF NOT EXISTS Product (
    Product_ID CHAR(10) PRIMARY KEY,
    Product_Name VARCHAR(100) NOT NULL,
    Description VARCHAR(200),
    Color VARCHAR(80) NOT NULL,
    Price DECIMAL(10,2) CHECK (Price BETWEEN 0 AND 999999) NOT NULL,
    Stock_Quantity INT NOT NULL,
    Collection VARCHAR(50) NOT NULL,
    Iphone_Model VARCHAR(50) NOT NULL,
    Product_Img LONGTEXT 
);

INSERT INTO Admin_Info (Admin_ID, First_Name, Last_Name, Address, Dateofbirth, Email) VALUES
('AD66047', 'Thanyathip', 'Korapintavangkul', '16 Chotisahai, rimklongprapa road, Bangsue, Bangkok 10800', '2005-09-24', 'thanyathip.kor@student.mahidol.ac.th'),
('AD66071', 'Ornrumpha', 'Nirundorn', '129/634 Soi Wat Saima, Rattanatibet Road, Bangraknoi, Nonthaburi 11000', '2005-11-17', 'ornrumpha.nir@student.mahidol.ac.th'),
('AD66120', 'Pannatorn', 'Suyaoei', '456/14 Mantana Bangna KM15, Bang Chalong, Bang Phli, Samutprakan 10540', '2005-01-11', 'pannatorn.suy@student.mahidol.ac.th'),
('AD66038', 'Chanikarn', 'Kaewkomut', '99/128 Ratchada-Thapra Road, Wat Tha Phra, Bangkok Yai, Bangkok 10600', '2005-01-28', 'chanikarn.kaw@student.mahidol.ac.th'),
('AD66117', 'Thanyarat', 'Suksuwan', '75 Silom Road, Suriyawong, Bang Rak, Bangkok 10500', '2005-05-05', 'thanyarat.suk@student.mahidol.ac.th'),
('AD64224', 'Pichetpong', 'Chiradatesakunvong', '50 Sukhumvit Road, Khlong Toei Nuea, Watthana, Bangkok 10110', '2004-04-23', 'honglykn@gmail.com'),
('AD66156', 'Edward', 'Wattraserte', '75 Soi Romklao 19/1, Khlong Sam Prawet, Lat Krabang, Bangkok 10520', '2005-02-14', 'ongleekub@gmail.com'),
('AD68022', 'Ananda', 'Chatchaiyanont', '12 Sukhumvit Soi 33, Khlong Tan Nuea, Watthana, Bangkok 10110', '2000-12-25', 'ananda.ch@gmail.com'),
('AD67093', 'Samantha', 'Phongsan', '89/5 Soi Ladprao 71, Wang Thong Lang, Bangkok 10310', '1995-12-31', 'samantha.phongsan@email.com'),
('AD65192', 'Kittipong', 'Sangsrisuk', '24 Ramkhamhaeng Road, Saphansung, Bangkok 10240', '1997-07-15', 'kittipong.sang@email.com');

INSERT INTO Admin_Login (Admin_ID, Password, Login_Time, Logout_Time) VALUES
('AD66156', 'Edw@rd1234_secure', '2025-04-10 09:50:00', '2025-04-10 12:10:00'),
('AD66120', 'ilovemoodengNGA3', '2025-04-11 07:55:30', '2025-04-11 10:45:00'),
('AD68022', 'Ananda#29!Powerful', '2025-04-12 07:30:00', '2025-04-12 10:10:00'),
('AD66047', 'Iyouwetheyhesheit888?', '2025-04-12 09:00:00', '2025-04-12 11:00:00'),
('AD66117', 'bunnyYellow555', '2025-04-13 08:20:00', '2025-04-13 11:30:00'),
('AD66071', 'Smwhrnlywknwww', '2025-04-14 08:45:00', '2025-04-14 12:00:00'),
('AD67093', 'Mantrajennie444', '2025-04-14 10:30:00', '2025-04-14 13:15:00'),
('AD65192', 'K!ttipong_Smart$2022', '2025-04-15 08:10:00', '2025-04-15 11:00:00'),
('AD64224', 'PiChet23#Amazing!', '2025-04-15 11:15:00', '2025-04-15 13:45:00'),
('AD66038', 'HoldOnUntilThe3nD', '2025-04-16 10:10:00','2025-04-16 10:50:00');

INSERT INTO Product (Product_ID, Product_Name, Description, Color, Price, Stock_Quantity, Collection, Iphone_Model, Product_Img) VALUES
('24SMGH1401', 'Grey Hamster', 'A stylish grey hamster silicone phone case, designed to protect your phone from drops and scratches, while offering a soft and durable feel.', 'Grey',  1200.00, 94, 'Samote', '14', '/uploads/1745698759470-hamster.jpg'),
('24SMGH1501', 'Grey Hamster', 'A stylish grey hamster silicone phone case, designed to protect your phone from drops and scratches, while offering a soft and durable feel.', 'Grey',1200.00, 87, 'Samote', '15', '/uploads/1745698759470-hamster.jpg'),
('24SMGH1601', 'Grey Hamster', 'A stylish grey hamster silicone phone case, designed to protect your phone from drops and scratches, while offering a soft and durable feel.', 'Grey',1200.00, 100, 'Samote', '16', '/uploads/1745698759470-hamster.jpg'),
('24SMYB1401', 'Yellow Bunny', 'A cute yellow bunny silicone phone case that provides excellent protection against scratches and bumps, offering a smooth, flexible fit.', 'Yellow',1100.00, 76, 'Samote', '14', '/uploads/1745699576010-rabbit.jpg'),
('24SMYB1501', 'Yellow Bunny', 'A cute yellow bunny silicone phone case that provides excellent protection against scratches and bumps, offering a smooth, flexible fit.', 'Yellow',1100.00, 98, 'Samote', '15', '/uploads/1745699576010-rabbit.jpg'),
('24SMYB1601', 'Yellow Bunny', 'A cute yellow bunny silicone phone case that provides excellent protection against scratches and bumps, offering a smooth, flexible fit.', 'Yellow',1100.00, 64, 'Samote', '16', '/uploads/1745699576010-rabbit.jpg'),
('24SMMR1401', 'MInt Raccoon', 'A mint green raccoon silicone phone case with a fun design, providing solid protection and a soft texture to keep your device safe.', 'Mint',1000.00, 72, 'Samote', '14', '/uploads/1745700140540-raccoon.jpg'),
('24SMMR1501', 'MInt Raccoon', 'A mint green raccoon silicone phone case with a fun design, providing solid protection and a soft texture to keep your device safe.', 'Mint',1000.00, 81, 'Samote', '15', '/uploads/1745700140540-raccoon.jpg'),
('24SMMR1601', 'MInt Raccoon', 'A mint green raccoon silicone phone case with a fun design, providing solid protection and a soft texture to keep your device safe.', 'Mint',1000.00, 92, 'Samote', '16', '/uploads/1745700140540-raccoon.jpg'),
('24SMMC1401', 'Magenta Cat', 'A vibrant magenta cat silicone phone case that combines style and durability, offering great drop protection while maintaining a smooth touch.', 'Pink',2000.00, 63, 'Samote', '14', '/uploads/1745700415746-cat.jpg'),
('24SMMC1501', 'Magenta Cat', 'A vibrant magenta cat silicone phone case that combines style and durability, offering great drop protection while maintaining a smooth touch.', 'Pink', 2000.00, 72, 'Samote', '15', '/uploads/1745700415746-cat.jpg'),
('24SMMC1601', 'Magenta Cat', 'A vibrant magenta cat silicone phone case that combines style and durability, offering great drop protection while maintaining a smooth touch.', 'Pink', 2000.00, 99, 'Samote', '16', '/uploads/1745700415746-cat.jpg'),
('24SMPG1401', 'Pink Golden', 'A cute and vibrant pink silicone phone case featuring a Golden Retriever dog design, offering excellent protection and style for your iPhone.', 'Pink', 1000.00, 87, 'Samote', '14', '/uploads/1745700508919-golden.jpg'),
('24SMPG1501', 'Pink Golden', 'A cute and vibrant pink silicone phone case featuring a Golden Retriever dog design, offering excellent protection and style for your iPhone.', 'Pink',1000.00, 95, 'Samote', '15', '/uploads/1745700508919-golden.jpg'),
('24SMPG1601', 'Pink Golden', 'A cute and vibrant pink silicone phone case featuring a Golden Retriever dog design, offering excellent protection and style for your iPhone.', 'Pink',1000.00, 65, 'Samote', '16', '/uploads/1745700508919-golden.jpg'),
('25PLLD1401', 'Lavender Dream', 'Soft, dreamy, and effortlessly calming this pastel lavender case brings a touch of serenity to your everyday. Perfect for gentle souls and peaceful vibes.', 'Purple',990.00, 100, 'Plain', '14', '/uploads/1745700715778-LavenderDream.jpg'),
('25PLLD1501', 'Lavender Dream', 'Soft, dreamy, and effortlessly calming this pastel lavender case brings a touch of serenity to your everyday. Perfect for gentle souls and peaceful vibes.', 'Purple',990.00, 88, 'Plain', '15', '/uploads/1745700715778-LavenderDream.jpg'),
('25PLLD1601', 'Lavender Dream', 'Soft, dreamy, and effortlessly calming this pastel lavender case brings a touch of serenity to your everyday. Perfect for gentle souls and peaceful vibes.', 'Purple',990.00, 40, 'Plain', '16', '/uploads/1745700715778-LavenderDream.jpg'),
('25PLSB1401', 'Sky Blue', 'Like a clear summer sky, this smooth blue case adds a breath of fresh air to your day. Simple, calm, and endlessly uplifting.', 'Blue',990.00, 83, 'Plain', '14', '/uploads/1745700960852-Bluesky.jpg'),
('25PLSB1501', 'Sky Blue', 'Like a clear summer sky, this smooth blue case adds a breath of fresh air to your day. Simple, calm, and endlessly uplifting.', 'Blue',990.00, 100, 'Plain', '15', '/uploads/1745700960852-Bluesky.jpg'),
('25PLSB1601', 'Sky Blue', 'Like a clear summer sky, this smooth blue case adds a breath of fresh air to your day. Simple, calm, and endlessly uplifting.', 'Blue',990.00, 74, 'Plain', '16', '/uploads/1745700960852-Bluesky.jpg'),
('25PLBV1401', 'Banana Vibes', 'Cheerful and playful, this sunny yellow case brings instant smiles. It\'s all about fun, brightness, and good energy the ultimate feel-good accessory!', 'Yellow',990.00, 65, 'Plain', '14', '/uploads/1745701273496-BananaVibes.jpg'),
('25PLBV1402', 'Banana Vibes', 'Cheerful and playful, this sunny yellow case brings instant smiles. It\'s all about fun, brightness, and good energy the ultimate feel-good accessory!', 'Yellow',990.00, 42, 'Plain', '15', '/uploads/1745701273496-BananaVibes.jpg'),
('25PLBV1403', 'Banana Vibes', 'Cheerful and playful, this sunny yellow case brings instant smiles. It\'s all about fun, brightness, and good energy the ultimate feel-good accessory!', 'Yellow',990.00, 78, 'Plain', '16', '/uploads/1745701273496-BananaVibes.jpg');
