#!/usr/bin/perl

use IO::Socket::INET;
use DBI qw(:sql_types);
use HTTP::Date;
use Proc::Daemon;
#$debug=true;
if (!$debug) {
   Proc::Daemon::Init({work_dir=>'/root',});
}

#Interpret power production data from a Pika Energy Island inverter
# insert it into a database

my $continue = 1;
$SIG {
    TERM
} = sub {
    $continue = 0
};

my $config;
my $configfile = "config.pl";
unless($config = do $configfile) {
    die "couldn't parse $configfile: $@"
    if $@;
    die "couldn't do $configfile: $!"
    unless defined $config;
    die "couldn't run $configfile"
    unless $config;
}

open(LOGFILE, '>>', '/root/odd-packets.txt') or die "couldn't open logfile\n";
#auto-flush on socket
$| = 1;
my($dbname, $host, $port, $dbusername, $dbpasswd, $filename);#Satisfy strict
$dbname = $config->{dbname};
$host = $config->{host};
$dbusername = $config->{dbusername};
$dbpasswd = $config->{dbpasswd};
$port = $config->{port};
my $datasource = "dbi:mysql:database=$dbname;host=$host";
my $dbh = DBI->connect($datasource, $dbusername, $dbpasswd) || die "Could not connect to database: $DBI::errstr";
$dbh->{
    mysql_auto_reconnect
} = 1;
#print "connected to db\n";
my $insert1 = qq(insert into power_statuses(serial, name, status, type, watts_now, watthours_total, update_time, voltage, export_watts) values( ? , ? , ? , ? , ? , ? , now(), ?, ? ));
my $insert_handle1 = $dbh->prepare($insert1);
my $PORT = 4153;
#creating a listening socket
my $socket = new IO::Socket::INET(
    LocalHost => '0.0.0.0',
    LocalPort => $PORT,
    Proto => 'tcp',
    Listen => 5,
    Reuse => 1
);

die "cannot create socket $!\n"
unless $socket;

print LOGFILE "server waiting for client connection on port $PORT\n"
or die "Couldn't write to the log\n";
my $reopen = 1;
my $client_socket = $socket->accept();
setsockopt($client_socket, SOL_SOCKET, SO_RCVTIMEO, pack('L!L!', +30, 0));
#get information about a newly connected client
my $client_address = $client_socket->peerhost();
my $client_port = $client_socket->peerport();
$reopen = 0;
while ($continue) {
    if ($reopen) {
        $socket->close();
        $socket = new IO::Socket::INET(
            LocalHost => '0.0.0.0',
            LocalPort => $PORT,
            Proto => 'tcp',
            Listen => 5,
            Reuse => 1
        );
        $client_socket = $socket->accept();
        setsockopt($client_socket, SOL_SOCKET, SO_RCVTIMEO, pack('L!L!', +30, 0));
        #  get information about a newly connected client
        $client_address = $client_socket->peerhost();
        $client_port = $client_socket->peerport();
        $reopen = 0;
    }
    #    read up to 1024 characters from the connected client
    my $data = "";
    $client_socket->recv($data, 1024);
    if (!$data) {
        $reopen = 1;
    }
    if ($data =~ m/IDNT/ ) {
        $data = "RETR";#        Can be anything really, it doesn 't seem to care.
        $client_socket->send($data);
    }
    elsif($data =~ m/PING/ ){
    # The inverter drops off the network after a ping unless it gets a pong {
        $data = "PONG";
        $client_socket->send($data);
    }
    elsif($data =~ m/UPDT/ ) {
        #Here is the most important line in the file VVVVVVVVVVVVVVV
        my($packettype, $serial, $flag, $status, $watts, $wattsTotal, $devtype, $ddunno, $acvolts, $dunnothisone, $dcvolts, $dunno, $wattslone, $wattsltwo, $therest) = unpack 'A4H10CssIsH36sssH24ssH*', $data;
        #Get some data into the format the db expects.
	$gridwatts = undef;
        if ($devtype == 7) {
		#The inverter reports this value if CTs are not installed.
		if ($dcvolts != 0x8000) {
			$gridwatts = $dcvolts;
		}
		$dcvolts = 0;
	}
	else {
             $dcvolts = int($dcvolts) / 10.0;
	}
        $acvolts = int($acvolts) / 10.0;
        $serial = "00$serial";
     if ($devtype == 7 && $debug) {
            my $all = unpack 'H*', $data;
#            print "$all\n";
            print "t: $devtype s:$serial st:$status p:$watts etotal:$wattsTotal etoday:$wattstoday $ddunno a:$acvolts w:$wattslone $wattsltwo gridwatts: $gridwatts \n";
        }
	elsif ($debug) {
#		 print "s:$serial st:$status p:$watts etotal:$wattsTotal etoday:$wattstoday $ddunno a:$acvolts w:$wattslone $wattsltwo v:$dcvolts \n";
	}
        my $devname = "PV Link";
	$volts = $dcvolts;
        if ($devtype == 7) {
            $devname = "X7601 Inverter";
	    $volts = $acvolts;
        }
        $data = "";
        $client_socket->send($data);
        $insert_handle1->bind_param(3, $status, SQL_INTEGER);
        $insert_handle1->bind_param(5, $watts, SQL_INTEGER);
        $insert_handle1->bind_param(6, $wattsTotal, SQL_INTEGER);
        $insert_handle1->bind_param(7, $status, SQL_INTEGER);
        $insert_handle1->execute($serial, $devname, $status, $devname, int($watts), int($wattsTotal), $volts, $gridwatts);

    } else {
        my $all = unpack 'H*', $data;
        if ($data) {
            print LOGFILE localtime().
            ": $all\n";
        }
        $data = "FINE";
        $client_socket->send($data);
    }

}
close LOGFILE;
$dbh->disconnect();
$socket->close();
