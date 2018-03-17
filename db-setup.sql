-- MySQL dump 10.13  Distrib 5.5.54, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: pika
-- ------------------------------------------------------
-- Server version	5.5.54-0+deb7u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `power_statuses`
--

DROP TABLE IF EXISTS `power_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `power_statuses` (
  `serial` varchar(20) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `watts_now` int(11) DEFAULT NULL,
  `watthours_total` int(11) DEFAULT NULL,
  `m` varchar(30) DEFAULT NULL,
  `ti` varchar(30) DEFAULT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voltage` int(11) DEFAULT NULL,
  `watthours_now` int(11) DEFAULT NULL,
  KEY `date_ser_idx` (`serial`,`update_time`),
  KEY `date_idx` (`update_time`),
  KEY `ser_idx` (`serial`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status_messages`
--

DROP TABLE IF EXISTS `status_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `status_messages` (
  `inverter_value` int(11) DEFAULT NULL,
  `message` varchar(30) DEFAULT NULL,
  `classification` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_messages`
--

LOCK TABLES `status_messages` WRITE;
/*!40000 ALTER TABLE `status_messages` DISABLE KEYS */;
INSERT INTO `status_messages` VALUES (0,'undefined','Neutral'),(16,'disabled','Neutral'),(256,'initializing','Neutral'),(272,'powering up','Good'),(288,'connecting bus','Good'),(304,'disconnecting bus','Neutral'),(320,'testing bus','Neutral'),(512,'low bus V','Neutral'),(768,'standby','Neutral'),(784,'waiting','Neutral'),(2048,'connecting grid','Good'),(2064,'disconnecting grid','Neutral'),(2080,'grid connected','Good'),(2096,'islanded','Good'),(4096,'low input V','Neutral'),(4112,'testing input','Neutral'),(8192,'running','Good'),(8208,'making power','Good'),(8224,'limiting power','Good'),(12288,'low wind','Good'),(12544,'low sun','Good'),(24576,'charging battery','Good'),(24608,'charging battery','Good'),(24592,'regulating battery','Good'),(24832,'charge complete','Good'),(28672,'error','Bad'),(28688,'over input V!','Bad'),(28704,'over output V!','Bad'),(28720,'over input I!','Bad'),(28736,'over output I!','Bad'),(28928,'overheating','Bad'),(32768,'offline','Neutral');
/*!40000 ALTER TABLE `status_messages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

create table daily_summaries (serial VARCHAR(20), date DATE, max_power int(11), watthours_today int(11));
create unique index device_day on daily_summaries(date, serial);

delimiter #
CREATE TRIGGER update_sum AFTER INSERT on power_statuses FOR EACH ROW 
BEGIN
  declare etoday int;
  declare pmax int;
  select max(watts_now), max(watthours_total) - min(watthours_total)  into @pmax, @etoday from power_statuses where update_time between curdate() and now() and serial = new.serial;

  insert into daily_summaries (serial, date, max_power, watthours_today) values (new.serial, curdate(), @pmax, @etoday)
  ON DUPLICATE KEY UPDATE watthours_today=@etoday, max_power=@pmax;
END#
delimiter ;
-- Dump completed on 2017-05-15 20:31:31
