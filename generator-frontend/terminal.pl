#!/usr/bin/perl 
use strict;
use warnings;

# Print with automatic \n :D
sub println
{
    my ($foo) = @_;
    print ($foo . "\n");
}

sub main
{
    #my $mystr = system("df -h");
    #println($mystr);
}

main();