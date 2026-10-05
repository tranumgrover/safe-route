CREATE DATABASE IF NOT EXISTS saferoute_db;
USE saferoute_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('USER','ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relation VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE safe_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    type ENUM('POLICE','HOSPITAL','SHELTER','SHOP','TRANSPORT') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    added_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(id)
);

CREATE TABLE danger_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    radius_meters INT DEFAULT 100,
    severity ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    description TEXT,
    report_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    description TEXT,
    incident_type ENUM('HARASSMENT','STALKING','ASSAULT','SUSPICIOUS','OTHER') NOT NULL,
    severity ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    status ENUM('OPEN','RESOLVED','INVESTIGATING') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_name VARCHAR(200),
    end_name VARCHAR(200),
    start_lat DOUBLE NOT NULL,
    start_lng DOUBLE NOT NULL,
    end_lat DOUBLE NOT NULL,
    end_lng DOUBLE NOT NULL,
    safety_score DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sos_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    message TEXT,
    status ENUM('ACTIVE','RESOLVED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample Data
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@saferoute.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '9999999999', 'ADMIN'),
('Priya Sharma', 'priya@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '9876543210', 'USER'),
('Anjali Singh', 'anjali@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '9123456780', 'USER');
-- Default password for all: "password123"

INSERT INTO safe_zones (name, description, latitude, longitude, type, is_verified) VALUES
('City Police Station', 'Main city police station - 24/7', 31.3260, 75.5762, 'POLICE', TRUE),
('Civil Hospital', 'Government civil hospital', 31.3350, 75.5800, 'HOSPITAL', TRUE),
('Central Bus Stand', 'Main bus terminal with security', 31.3290, 75.5710, 'TRANSPORT', TRUE),
('Women Shelter Home', 'Safe shelter for women in distress', 31.3210, 75.5850, 'SHELTER', TRUE),
('24hr Medical Store', 'Open all night pharmacy', 31.3310, 75.5780, 'SHOP', FALSE);

INSERT INTO danger_zones (latitude, longitude, radius_meters, severity, description, report_count) VALUES
(31.3150, 75.5650, 200, 'HIGH', 'Dark alley, multiple incidents reported', 8),
(31.3400, 75.5900, 150, 'MEDIUM', 'Poorly lit stretch near old market', 4),
(31.3270, 75.5700, 100, 'LOW', 'Isolated area after 9pm', 2);

INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES
(2, 'Ramesh Sharma', '9876500001', 'Father'),
(2, 'Meena Sharma', '9876500002', 'Mother'),
(3, 'Vikram Singh', '9123400001', 'Brother');
